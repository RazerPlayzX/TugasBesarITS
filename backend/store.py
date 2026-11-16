import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from .rules import snapshot

ROOT = Path(__file__).resolve().parents[1]


def database_path():
    return Path(os.getenv('ITS_DB', str(ROOT / 'runtime' / 'its.sqlite3')))


@contextmanager
def connection():
    db = sqlite3.connect(database_path(), timeout=15)
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA foreign_keys=ON')
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def initialize():
    database_path().parent.mkdir(parents=True, exist_ok=True)
    with connection() as db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id), csrf TEXT NOT NULL, expires REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS recommendations(id TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), payload TEXT NOT NULL, created REAL NOT NULL);
        CREATE TABLE IF NOT EXISTS quests(user_id INTEGER PRIMARY KEY REFERENCES users(id), payload TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS completions(user_id INTEGER REFERENCES users(id), course_id TEXT, payload TEXT NOT NULL, PRIMARY KEY(user_id, course_id));
        PRAGMA user_version=1;
        ''')


def state(db, user_id):
    quest = db.execute('SELECT payload FROM quests WHERE user_id=?', (user_id,)).fetchone()
    rows = db.execute('SELECT payload FROM completions WHERE user_id=? ORDER BY rowid', (user_id,)).fetchall()
    return snapshot(json.loads(quest['payload']) if quest else None, [json.loads(r['payload']) for r in rows])


if __name__ == '__main__':
    from dotenv import load_dotenv
    load_dotenv(ROOT / '.env')
    initialize()
    print('Database siap:', database_path())
