import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS } from '../src/levels2d.js';

test('ten levels place two or three moving objects on each main ground segment', () => {
  assert.equal(LEVELS.length, 10);
  LEVELS.forEach((level) => {
    const mainGroundCount = level.solids.filter((solid) => solid.y >= 32 * 12 && solid.w >= 32 * 4).length;
    assert.equal(level.enemies.length >= mainGroundCount * 2, true);
    assert.equal(level.enemies.length <= mainGroundCount * 3, true);
  });
});

test('late levels use faster moving objects than early levels', () => {
  const earlySpeed = Math.abs(LEVELS[0].enemies[0].vx);
  const lateSpeed = Math.abs(LEVELS[9].enemies.at(-1).vx);
  assert.equal(lateSpeed > earlySpeed * 2, true);
});
