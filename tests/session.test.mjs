import test from 'node:test';
import assert from 'node:assert/strict';
import { createDemoSession, SESSION_KEY } from '../frontend/assets/js/session.js';

const storage = () => {
  const values = new Map([['unrelated', 'keep']]);
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
};

test('sesi hanya menyimpan penanda demo dan keluar mempertahankan key lain', () => {
  const store = storage();
  const session = createDemoSession(() => store);
  assert.equal(session.isActive(), false);
  session.enter();
  assert.deepEqual(JSON.parse(store.getItem(SESSION_KEY)), { schema_version: 1, mode: 'demo' });
  assert.equal(createDemoSession(() => store).isActive(), true);
  session.exit();
  assert.equal(session.isActive(), false);
  assert.equal(store.getItem(SESSION_KEY), null);
  assert.equal(store.getItem('unrelated'), 'keep');
});
for (const raw of ['{broken', 'null', '{"schema_version":2,"mode":"demo"}']) {
  test(`penanda sesi tidak valid ditangani: ${raw}`, () => {
    const store = storage();
    store.setItem(SESSION_KEY, raw);
    const session = createDemoSession(() => store);
    assert.equal(session.isActive(), false);
    assert.ok(session.notice());
    session.enter();
    assert.equal(session.isActive(), true);
  });
}
test('storage sesi diblokir: masuk dan keluar tetap bekerja di memori', () => {
  const session = createDemoSession(() => { throw new Error('blocked'); });
  session.enter();
  assert.equal(session.isActive(), true);
  assert.ok(session.notice());
  session.exit();
  assert.equal(session.isActive(), false);
});
