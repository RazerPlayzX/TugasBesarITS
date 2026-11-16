from concurrent.futures import ThreadPoolExecutor
import json
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sklearn.metrics.pairwise import cosine_similarity
from backend.main import app
from backend.rules import adapt, reward, level
from backend.recommendation import ARTIFACTS

ORIGIN = {'Origin': 'http://127.0.0.1:8001'}
CREDS = {'email': 'student@example.test', 'password': 'test-password-123'}


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv('ITS_DB', str(tmp_path / 'test.sqlite3'))
    with TestClient(app) as c:
        c.headers.update(ORIGIN)
        yield c


def account(c, email=CREDS['email']):
    r = c.post('/api/register', json={**CREDS, 'email': email, 'name': 'Mahasiswa Uji'})
    assert r.status_code == 201
    c.headers['X-CSRF-Token'] = r.json()['csrf_token']


def recommend(c, **extra):
    return c.post('/api/recommend', json={'topic': 'python programming', 'ability': 'Intermediate', 'score': 45, **extra})


def quest(c):
    result = recommend(c).json()
    assert result['courses']
    r = c.post('/api/quest', json={'recommendation_id': result['recommendation_id'], 'course_ids': [x['course_id'] for x in result['courses']]})
    assert r.status_code == 200, r.text
    return r.json()['quest']


def test_auth_and_csrf(client):
    assert client.get('/api/me').status_code == 401
    account(client)
    assert 'HttpOnly' in client.cookies.jar._cookies['testserver.local']['/']['its_session']._rest
    assert client.get('/api/me').json()['user']['name'] == 'Mahasiswa Uji'
    assert client.post('/api/recommend', json={}, headers={'X-CSRF-Token': 'wrong'}).status_code == 403
    assert client.post('/api/login', json=CREDS, headers={'Origin': 'https://evil.test'}).status_code == 403
    assert client.post('/api/logout', json={}).status_code == 204
    assert client.get('/api/me').status_code == 401
    assert client.post('/api/login', json={**CREDS, 'password': 'incorrect-password'}).status_code == 401
    assert client.post('/api/login', json=CREDS).status_code == 200


@pytest.mark.parametrize('patch,status', [({'topic':''},422),({'topic':'  '},422),({'ability':'Conversant'},422),({'score':-1},422),({'score':101},422),({'score':True},422),({'limit':0},422),({'limit':21},422),({'score':0},200),({'score':100},200),({'topic':'zzzzqqqqxxxx'},200)])
def test_validation(client, patch, status):
    account(client)
    response = recommend(client, **patch)
    assert response.status_code == status
    if patch.get('topic') == 'zzzzqqqqxxxx':
        assert response.json()['courses'] == []


@pytest.mark.parametrize('score,target,xp', [(59,'Beginner',30),(60,'Intermediate',40),(79,'Intermediate',40),(80,'Advanced',50),(90,'Advanced',70),(100,'Advanced',70)])
def test_boundaries(score, target, xp):
    assert adapt(score,'Intermediate')['target_level'] == target
    assert reward(score)[0] == xp
    assert [level(x) for x in [0,99,100,199,200,299,300]] == [1,1,2,2,3,3,4]


def test_atomic_completion_isolation_persistence(client):
    account(client)
    q = quest(client)
    payload = {'quest_id':q['id'],'course_id':q['courses'][0]['course_id'],'score':90}
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda _: client.post('/api/complete',json=payload), range(2)))
    assert all(r.status_code == 200 for r in responses)
    assert sorted(r.json()['xp_awarded'] for r in responses) == [0,70]
    state = client.get('/api/me').json()['state']
    assert state['profile']['xp'] == 70 and len(state['profile']['badges']) == 3
    assert state['progress']['total'] == len(q['courses'])
    assert payload['course_id'] not in [x['course_id'] for x in recommend(client).json()['courses']]
    client.post('/api/logout',json={})
    account(client, 'other@example.test')
    assert client.post('/api/complete',json=payload).status_code == 404
    assert client.get('/api/me').json()['state']['profile']['xp'] == 0
    client.post('/api/logout',json={})
    token = client.post('/api/login',json=CREDS).json()['csrf_token']
    client.headers['X-CSRF-Token'] = token
    assert client.get('/api/me').json()['state']['profile']['xp'] == 70
    # Reinitialize application lifecycle against the same database, including model reload.
    with TestClient(app) as restarted:
        restarted.cookies.update(client.cookies)
        assert restarted.get('/api/me').json()['state']['profile']['xp'] == 70


def test_model_against_export_and_failure(client):
    model = app.state.model
    assert model is not None
    scores = cosine_similarity(model.matrix[0], model.matrix).ravel()
    expected = pd.read_csv(ARTIFACTS/'contoh_rekomendasi.csv')
    for _, row in expected.iterrows():
        i = model.courses.index[model.courses.course_id == row.course_id][0]
        assert np.isclose(scores[i], row['Skor Cosine Similarity'], atol=1e-10)
    account(client)
    app.state.model = None
    assert client.get('/health').status_code == 503
    assert recommend(client).status_code == 503
    app.state.model = model


def test_ownership_tampering_expiry_and_level_up(client):
    from backend import store
    account(client)
    q = quest(client)
    second = {'quest_id':q['id'], 'course_id':q['courses'][1]['course_id'], 'score':80}
    first = {**second, 'course_id':q['courses'][0]['course_id'], 'score':90}
    assert client.post('/api/complete',json={**first,'xp':999}).status_code == 422
    assert client.post('/api/complete',json={**first,'course_id':'foreign'}).status_code == 422
    assert client.post('/api/complete',json=first).json()['xp_awarded'] == 70
    result = client.post('/api/complete',json=second).json()
    assert (result['total_xp'],result['level_before'],result['level_after']) == (120,1,2)
    assert result['new_badges'] == []
    rec = recommend(client).json()
    client.post('/api/logout',json={})
    account(client, 'isolation@example.test')
    assert client.post('/api/quest',json={'recommendation_id':rec['recommendation_id'],'course_ids':[rec['courses'][0]['course_id']]}).status_code == 404
    with store.connection() as db:
        db.execute('UPDATE sessions SET expires=0')
    assert client.get('/api/me').status_code == 401
