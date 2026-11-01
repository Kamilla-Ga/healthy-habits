import test from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, readDay, writeDay } from './storage.js';
const storage = () => { const data = new Map(); return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }; };
test('uses the local calendar date, including month and year boundaries', () => {
 assert.equal(dayKey(new Date(2026, 0, 1, 0, 1)), '2026-01-01');
 assert.equal(dayKey(new Date(2026, 11, 31, 23, 59)), '2026-12-31');
});
test('persists all five habits, supports undo, and keeps days separate', () => {
 const store = storage(); const all = ['water','sleep','activity','skincare','learning'];
 writeDay(store, '2026-10-31', all);
 assert.deepEqual(readDay(store, '2026-10-31'), all);
 assert.deepEqual(readDay(store, '2026-11-01'), []);
 writeDay(store, '2026-11-01', ['sleep']);
 writeDay(store, '2026-10-31', all.filter(id => id !== 'water'));
 assert.equal(readDay(store, '2026-10-31').length, 4);
 assert.deepEqual(readDay(store, '2026-11-01'), ['sleep']);
});
test('ignores unknown, duplicate and invalid stored habit lists', () => {
 const store = storage();
 store.setItem('healthy-habits:test', '["water","water","unknown"]');
 assert.deepEqual(readDay(store, 'test'), ['water']);
 store.setItem('healthy-habits:test', '{}');
 assert.deepEqual(readDay(store, 'test'), []);
});
