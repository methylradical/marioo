import test from 'node:test';
import assert from 'node:assert/strict';
import { getGrowthStats, gainGrowthCoins, resolveBodyHitGrowth } from '../src/growth2d.js';

test('growth starts at normal size and movement', () => {
  const stats = getGrowthStats(0);
  assert.equal(stats.power, 1);
  assert.equal(stats.scale, 1);
  assert.equal(stats.jumpMultiplier, 1);
  assert.equal(stats.airMultiplier, 1);
});

test('growth stats increase when growth count rises', () => {
  const stats = getGrowthStats(6);
  assert.equal(stats.power > 1, true);
  assert.equal(stats.scale > 1, true);
  assert.equal(stats.jumpMultiplier > 1, true);
  assert.equal(stats.airMultiplier > 1, true);
});

test('growth is capped to keep levels playable', () => {
  const stats = getGrowthStats(20);
  assert.equal(stats.power, 2);
  assert.equal(stats.scale <= 1.45, true);
  assert.equal(stats.jumpMultiplier <= 1.34, true);
  assert.equal(stats.airMultiplier <= 1.28, true);
});

test('coins do not increase growth but stomps do with a cap', () => {
  assert.equal(gainGrowthCoins(2, 'coin'), 2);
  assert.equal(gainGrowthCoins(2, 'stomp'), 4);
  assert.equal(gainGrowthCoins(10, 'stomp'), 10);
});

test('body hit shrinks powered player instead of killing', () => {
  assert.deepEqual(resolveBodyHitGrowth(5), { coins: 2, died: false });
});

test('body hit kills unpowered player', () => {
  assert.deepEqual(resolveBodyHitGrowth(0), { coins: 0, died: true });
});
