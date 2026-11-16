import hashlib
import json
import logging
import os
import secrets
import sqlite3
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pwdlib import PasswordHash
from . import store
from .schemas import Registration, Credentials, Recommendation, QuestRequest, Completion, RecommendationResult, State, CompletionResult
from .recommendation import Recommender
from .rules import reward

load_dotenv(store.ROOT / '.env')
passwords = PasswordHash.recommended()
dummy_hash = passwords.hash(secrets.token_urlsafe(32))
COOKIE = 'its_session'
TTL = 60 * 60 * 12


def digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


@asynccontextmanager
async def lifespan(app):
    store.initialize()
    app.state.model = None
    try:
        app.state.model = Recommender()
    except Exception:
        logging.exception('Model lokal gagal dimuat; rekomendasi dinonaktifkan.')
    yield


app = FastAPI(title='Alur ITS API', lifespan=lifespan)


@app.middleware('http')
async def protection(request, call_next):
    if request.method not in ('GET', 'HEAD', 'OPTIONS'):
        origin = request.headers.get('origin')
        allowed = os.getenv('ITS_ORIGIN', 'http://127.0.0.1:8001')
        if origin != allowed:
            return JSONResponse({'detail': 'Origin permintaan tidak diizinkan.'}, status_code=403)
    response = await call_next(request)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'same-origin'
    return response


@app.exception_handler(RequestValidationError)
async def invalid(request, exc):
    # Do not echo credentials or raw request bodies in validation responses.
    return JSONResponse({'detail': 'Input tidak valid. Periksa kolom dan rentang nilainya.',
                         'fields': ['.'.join(str(x) for x in e['loc'][1:]) for e in exc.errors()]}, status_code=422)


@app.exception_handler(Exception)
async def failure(request, exc):
    logging.exception('Permintaan gagal', exc_info=exc)
    return JSONResponse({'detail': 'Penyimpanan atau layanan tidak tersedia. Silakan coba lagi.'}, status_code=503)


def identity(request: Request):
    with store.connection() as db:
        session = db.execute('SELECT * FROM sessions WHERE token=? AND expires>?', (digest(request.cookies.get(COOKIE, '')), time.time())).fetchone()
        if not session or session['user_id'] is None:
            raise HTTPException(401, 'Sesi berakhir. Silakan masuk kembali.')
        if request.method != 'GET' and not secrets.compare_digest(request.headers.get('x-csrf-token', ''), session['csrf']):
            raise HTTPException(403, 'Token CSRF tidak valid. Muat ulang halaman.')
        return session['user_id']


def login_session(db, user_id, response, previous):
    db.execute('DELETE FROM sessions WHERE expires<? OR token=?', (time.time(), digest(previous)))
    token, csrf = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
    db.execute('INSERT INTO sessions VALUES(?,?,?,?)', (digest(token), user_id, csrf, time.time()+TTL))
    response.set_cookie(COOKIE, token, httponly=True, samesite='lax', secure=os.getenv('ITS_COOKIE_SECURE', 'false').lower() == 'true', max_age=TTL)
    return csrf


@app.get('/health')
def health(response: Response):
    ready = app.state.model is not None
    response.status_code = 200 if ready else 503
    return {'status': 'ok' if ready else 'model_unavailable', 'model_ready': ready}


@app.post('/api/register', status_code=201)
def register(body: Registration, request: Request, response: Response):
    hashed = passwords.hash(body.password)
    with store.connection() as db:
        try:
            cursor = db.execute('INSERT INTO users(email,name,password_hash) VALUES(?,?,?)', (body.email, body.name, hashed))
        except sqlite3.IntegrityError:
            raise HTTPException(409, 'Alamat email sudah digunakan.')
        csrf = login_session(db, cursor.lastrowid, response, request.cookies.get(COOKIE, ''))
    return {'csrf_token': csrf}


@app.post('/api/login')
def login(body: Credentials, request: Request, response: Response):
    with store.connection() as db:
        user = db.execute('SELECT * FROM users WHERE email=?', (body.email,)).fetchone()
        valid = passwords.verify(body.password, user['password_hash'] if user else dummy_hash)
        if not user or not valid:
            raise HTTPException(401, 'Email atau password tidak sesuai.')
        return {'csrf_token': login_session(db, user['id'], response, request.cookies.get(COOKIE, ''))}


@app.get('/api/me')
def me(request: Request, uid=Depends(identity)):
    with store.connection() as db:
        user = db.execute('SELECT name,email FROM users WHERE id=?', (uid,)).fetchone()
        csrf = db.execute('SELECT csrf FROM sessions WHERE token=?', (digest(request.cookies[COOKIE]),)).fetchone()['csrf']
        return {'user': dict(user), 'csrf_token': csrf, 'state': store.state(db, uid)}


@app.post('/api/logout', status_code=204)
def logout(request: Request, response: Response, uid=Depends(identity)):
    with store.connection() as db:
        db.execute('DELETE FROM sessions WHERE token=?', (digest(request.cookies[COOKIE]),))
    response.delete_cookie(COOKIE)


@app.post('/api/recommend', response_model=RecommendationResult)
def recommend(body: Recommendation, uid=Depends(identity)):
    if app.state.model is None:
        raise HTTPException(503, 'Model gagal dimuat. Periksa konfigurasi server; tidak ada hasil pengganti.')
    with store.connection() as db:
        result = app.state.model.recommend(body, store.state(db, uid)['profile']['completedIds'])
        result['recommendation_id'] = secrets.token_urlsafe(24)
        db.execute('DELETE FROM recommendations WHERE created<?', (time.time()-86400,))
        db.execute('INSERT INTO recommendations VALUES(?,?,?,?)', (result['recommendation_id'], uid, json.dumps(result), time.time()))
        return result


@app.post('/api/quest', response_model=State)
def quest(body: QuestRequest, uid=Depends(identity)):
    with store.connection() as db:
        db.execute('BEGIN IMMEDIATE')
        row = db.execute('SELECT payload FROM recommendations WHERE id=? AND user_id=? AND created>?', (body.recommendation_id, uid, time.time()-86400)).fetchone()
        if not row:
            raise HTTPException(404, 'Rekomendasi tidak ditemukan atau kedaluwarsa. Cari kembali.')
        result = json.loads(row['payload'])
        current = store.state(db, uid)
        if current['quest'] and current['progress']['percent'] < 100 and not body.replace:
            raise HTTPException(409, 'Konfirmasi penggantian quest aktif diperlukan.')
        ids = set(body.course_ids)
        courses = [c for c in result['courses'] if c['course_id'] in ids and c['course_id'] not in current['profile']['completedIds']]
        if len(courses) != len(body.course_ids):
            raise HTTPException(422, 'Materi tidak valid, duplikat, atau sudah selesai.')
        payload = {'id': secrets.token_urlsafe(24), 'topic': result['request']['topic'], **result['adaptation'], 'courses': courses}
        db.execute('INSERT OR REPLACE INTO quests VALUES(?,?)', (uid, json.dumps(payload)))
        return store.state(db, uid)


@app.post('/api/complete', response_model=CompletionResult)
def complete(body: Completion, uid=Depends(identity)):
    with store.connection() as db:
        # Serialize state changes; unique(user, course) is the final deduplication guard.
        db.execute('BEGIN IMMEDIATE')
        before = store.state(db, uid)
        quest = before['quest']
        if not quest or quest['id'] != body.quest_id:
            raise HTTPException(404, 'Quest tidak ditemukan pada akun ini.')
        course = next((c for c in quest['courses'] if c['course_id'] == body.course_id), None)
        if not course:
            raise HTTPException(422, 'Materi bukan bagian quest aktif.')
        duplicate = body.course_id in before['profile']['completedIds']
        xp, badges = reward(body.score) if not duplicate else (0, [])
        if not duplicate:
            entry = {'course_id': body.course_id, 'title': course['title'], 'topic': quest['topic'], 'score': body.score, 'xp': xp, 'badges': badges}
            db.execute('INSERT INTO completions VALUES(?,?,?)', (uid, body.course_id, json.dumps(entry)))
        after = store.state(db, uid)
        return {'state': after, 'duplicate': duplicate, 'status': 'already_completed' if duplicate else 'completed',
                'xp_awarded': xp, 'total_xp': after['profile']['xp'], 'level_before': before['profile']['level'],
                'level_after': after['profile']['level'], 'new_badges': [b for b in badges if b not in before['profile']['badges']], 'progress': after['progress']}


app.mount('/', StaticFiles(directory=store.ROOT / 'frontend', html=True), name='frontend')
