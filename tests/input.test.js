import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CAMERA_YAW, computeDesiredMove } from '../src/input.js';

test('default forward input moves toward the level path', () => {
  const move = computeDesiredMove(DEFAULT_CAMERA_YAW, { x: 0, z: 1 });
  assert.equal(move.x > 0.99, true);
  assert.equal(Math.abs(move.z) < 0.001, true);
});

test('default right input moves toward screen right', () => {
  const move = computeDesiredMove(DEFAULT_CAMERA_YAW, { x: 1, z: 0 });
  assert.equal(Math.abs(move.x) < 0.001, true);
  assert.equal(move.z > 0.99, true);
});
