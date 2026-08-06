import test from 'node:test';
import assert from 'node:assert/strict';
import { rectsOverlap, createPlayer, resolveHorizontal, resolveVertical, tryJump, tryCoinJump } from '../src/physics2d.js';
import { LEVELS } from '../src/levels2d.js';

test('rectsOverlap detects intersection', () => {
  assert.equal(rectsOverlap(
    { x: 0, y: 0, w: 10, h: 10 },
    { x: 9, y: 9, w: 10, h: 10 },
  ), true);
});

test('player lands on solid ground and becomes grounded', () => {
  const player = createPlayer(0, 0);
  player.x = 70;
  player.y = 420;
  player.prevY = 390;
  player.vy = 500;
  resolveVertical(player, LEVELS[0].solids);
  assert.equal(player.grounded, true);
  assert.equal(player.vy, 0);
});

test('horizontal collision stops player at wall', () => {
  const player = createPlayer(0, 0);
  player.x = 140;
  player.y = 320;
  player.vx = 200;
  resolveHorizontal(player, [{ x: 160, y: 320, w: 32, h: 64 }]);
  assert.equal(player.vx, 0);
  assert.equal(player.x + player.w <= 160, true);
});

test('tryJump allows only the normal ground jump', () => {
  const player = createPlayer(0, 0);
  player.grounded = true;
  assert.equal(tryJump(player, 600), true);
  assert.equal(player.vy, -600);
  assert.equal(player.jumpsUsed, 1);

  player.grounded = false;
  assert.equal(tryJump(player, 600), false);
});

test('tryCoinJump consumes one coin jump for an air jump', () => {
  const player = createPlayer(0, 0);
  player.grounded = false;
  const result = tryCoinJump(player, 600, 1);
  assert.equal(result.jumped, true);
  assert.equal(result.coinJumps, 0);
  assert.equal(player.vy, -600);
  assert.equal(tryCoinJump(player, 600, 0).jumped, false);
});
