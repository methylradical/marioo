import test from 'node:test';
import assert from 'node:assert/strict';
import { createGameState, collectCoin, respawnPlayer, startGame } from '../src/game-state.js';
import { intersectsAabb, resolvePlatformLanding, findTouchedCoin, findTouchedEnemy } from '../src/collision.js';

test('createGameState returns resettable player and coin state', () => {
  const state = createGameState();
  assert.equal(state.player.position.x, 0);
  assert.equal(state.player.position.y, 3);
  assert.equal(state.coins.length > 0, true);
  assert.equal(state.collectedCoinIds.size, 0);
  assert.equal(state.phase, 'ready');
});

test('startGame changes ready state to playing', () => {
  const state = createGameState();
  assert.equal(startGame(state), true);
  assert.equal(state.phase, 'playing');
  assert.equal(state.status, 'Run started.');
  assert.equal(startGame(state), false);
});

test('collectCoin records score once', () => {
  const state = createGameState();
  const firstCoin = state.coins[0];
  assert.equal(collectCoin(state, firstCoin.id), true);
  assert.equal(state.score, 100);
  assert.equal(collectCoin(state, firstCoin.id), false);
  assert.equal(state.score, 100);
});

test('intersectsAabb detects overlapping boxes', () => {
  assert.equal(intersectsAabb(
    { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } },
    { min: { x: 0.5, y: 0.5, z: 0.5 }, max: { x: 2, y: 2, z: 2 } },
  ), true);
});

test('resolvePlatformLanding snaps falling player to platform top', () => {
  const player = {
    position: { x: 0, y: 1.1, z: 0 },
    previousY: 1.8,
    velocity: { x: 0, y: -8, z: 0 },
    size: { x: 0.8, y: 1.4, z: 0.8 },
    grounded: false,
  };
  const platforms = [{ id: 'ground', position: { x: 0, y: 0, z: 0 }, size: { x: 5, y: 1, z: 5 } }];
  const result = resolvePlatformLanding(player, platforms);
  assert.equal(result.platform.id, 'ground');
  assert.equal(player.grounded, true);
  assert.equal(player.velocity.y, 0);
  assert.equal(player.position.y, 1.2);
});

test('findTouchedCoin and findTouchedEnemy use player bounds', () => {
  const player = { position: { x: 0, y: 1, z: 0 }, size: { x: 1, y: 1, z: 1 } };
  assert.equal(findTouchedCoin(player, [{ id: 'c1', position: { x: 0.1, y: 1, z: 0.1 }, radius: 0.35 }]).id, 'c1');
  assert.equal(findTouchedEnemy(player, [{ id: 'e1', position: { x: 0.1, y: 1, z: 0.1 }, size: { x: 1, y: 1, z: 1 } }]).id, 'e1');
});

test('respawnPlayer restores checkpoint position and increments deaths', () => {
  const state = createGameState();
  state.player.position.x = 10;
  state.checkpoint = { x: 2, y: 4, z: 6 };
  respawnPlayer(state);
  assert.deepEqual(state.player.position, { x: 2, y: 4, z: 6 });
  assert.equal(state.deaths, 1);
});
