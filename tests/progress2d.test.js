import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStore, getSavedLevel, markLevelCleared, resetProgress } from '../src/progress2d.js';

test('markLevelCleared unlocks the next uncleared level', () => {
  const store = createMemoryStore();
  assert.equal(getSavedLevel(store, 5), 0);
  markLevelCleared(store, 0, 5);
  assert.equal(getSavedLevel(store, 5), 1);
});

test('progress does not move backward after replaying an earlier level', () => {
  const store = createMemoryStore();
  markLevelCleared(store, 2, 5);
  assert.equal(getSavedLevel(store, 5), 3);
  markLevelCleared(store, 0, 5);
  assert.equal(getSavedLevel(store, 5), 3);
});

test('resetProgress clears saved level', () => {
  const store = createMemoryStore();
  markLevelCleared(store, 1, 5);
  resetProgress(store);
  assert.equal(getSavedLevel(store, 5), 0);
});
