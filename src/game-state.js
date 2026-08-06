export const START_POSITION = { x: 0, y: 3, z: 0 };

export const LEVEL = {
  platforms: [
    { id: 'start', position: { x: 0, y: 0, z: 0 }, size: { x: 7, y: 1, z: 7 }, color: 0x5fbf6b },
    { id: 'step-1', position: { x: 7, y: 1.1, z: -1.5 }, size: { x: 4, y: 1, z: 4 }, color: 0x66c56f },
    { id: 'step-2', position: { x: 13, y: 2.2, z: 1.2 }, size: { x: 4, y: 1, z: 4 }, color: 0x65bb70 },
    { id: 'ridge', position: { x: 19, y: 3.2, z: 0 }, size: { x: 6, y: 1, z: 3.5 }, color: 0x71c96f },
    { id: 'enemy-walk', position: { x: 27, y: 2.4, z: -2 }, size: { x: 8, y: 1, z: 4 }, color: 0x75c875 },
    { id: 'checkpoint-island', position: { x: 36, y: 3.4, z: 1.5 }, size: { x: 5, y: 1, z: 5 }, color: 0x7ccb72 },
    { id: 'jump-island', position: { x: 43, y: 5.2, z: -1 }, size: { x: 4.5, y: 1, z: 4.5 }, color: 0x86ce77 },
    { id: 'finish-island', position: { x: 55, y: 6, z: 0 }, size: { x: 8, y: 1, z: 7 }, color: 0x77c76f },
  ],
  movingPlatforms: [
    {
      id: 'moving-bridge',
      basePosition: { x: 49, y: 5.7, z: -0.5 },
      position: { x: 49, y: 5.7, z: -0.5 },
      size: { x: 4.5, y: 0.7, z: 3.2 },
      axis: 'z',
      amplitude: 3.5,
      speed: 1.2,
      color: 0xf0b850,
    },
  ],
  coins: [
    { id: 'coin-1', position: { x: 2.2, y: 1.35, z: 1.8 }, radius: 0.45 },
    { id: 'coin-2', position: { x: 7, y: 2.45, z: -1.5 }, radius: 0.45 },
    { id: 'coin-3', position: { x: 13, y: 3.55, z: 1.2 }, radius: 0.45 },
    { id: 'coin-4', position: { x: 19, y: 4.55, z: -1.1 }, radius: 0.45 },
    { id: 'coin-5', position: { x: 27, y: 3.75, z: -2.8 }, radius: 0.45 },
    { id: 'coin-6', position: { x: 36, y: 4.75, z: 1.5 }, radius: 0.45 },
    { id: 'coin-7', position: { x: 43, y: 6.55, z: -1 }, radius: 0.45 },
    { id: 'coin-8', position: { x: 55, y: 7.35, z: -2 }, radius: 0.45 },
  ],
  enemies: [
    {
      id: 'roller-1',
      basePosition: { x: 27, y: 3.35, z: -2 },
      position: { x: 27, y: 3.35, z: -2 },
      size: { x: 1.2, y: 1, z: 1.2 },
      axis: 'x',
      amplitude: 3,
      speed: 1.35,
    },
    {
      id: 'roller-2',
      basePosition: { x: 55, y: 6.95, z: 2 },
      position: { x: 55, y: 6.95, z: 2 },
      size: { x: 1.2, y: 1, z: 1.2 },
      axis: 'z',
      amplitude: 2.5,
      speed: 1.6,
    },
  ],
  jumpPads: [
    { id: 'spring-1', position: { x: 43, y: 5.95, z: -1 }, size: { x: 1.8, y: 0.35, z: 1.8 }, impulse: 14 },
  ],
  checkpoints: [
    { id: 'checkpoint-1', position: { x: 36, y: 4.3, z: 1.5 }, radius: 1.2, spawn: { x: 36, y: 5.2, z: 1.5 } },
  ],
  finishGate: { id: 'finish', position: { x: 58, y: 7.2, z: 0 }, size: { x: 1.6, y: 2.6, z: 2.8 } },
};

function cloneVector(vector) {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function cloneEntity(entity) {
  return {
    ...entity,
    position: cloneVector(entity.position),
    size: entity.size ? cloneVector(entity.size) : undefined,
    basePosition: entity.basePosition ? cloneVector(entity.basePosition) : undefined,
    spawn: entity.spawn ? cloneVector(entity.spawn) : undefined,
  };
}

export function createGameState() {
  return {
    player: {
      position: cloneVector(START_POSITION),
      previousY: START_POSITION.y,
      velocity: { x: 0, y: 0, z: 0 },
      size: { x: 0.8, y: 1.4, z: 0.8 },
      grounded: false,
      carriedBy: null,
      yaw: 0,
    },
    platforms: LEVEL.platforms.map(cloneEntity),
    movingPlatforms: LEVEL.movingPlatforms.map(cloneEntity),
    coins: LEVEL.coins.map(cloneEntity),
    enemies: LEVEL.enemies.map(cloneEntity),
    jumpPads: LEVEL.jumpPads.map(cloneEntity),
    checkpoints: LEVEL.checkpoints.map(cloneEntity),
    finishGate: cloneEntity(LEVEL.finishGate),
    collectedCoinIds: new Set(),
    checkpoint: cloneVector(START_POSITION),
    phase: 'ready',
    score: 0,
    deaths: 0,
    elapsed: 0,
    status: 'Press Start to begin.',
    won: false,
    lastRespawnAt: 0,
  };
}

export function startGame(state) {
  if (state.phase !== 'ready') {
    return false;
  }
  state.phase = 'playing';
  state.status = 'Run started.';
  return true;
}

export function collectCoin(state, coinId) {
  if (state.collectedCoinIds.has(coinId)) {
    return false;
  }
  state.collectedCoinIds.add(coinId);
  state.score += 100;
  state.status = `Collected ${state.collectedCoinIds.size}/${state.coins.length} star coins.`;
  return true;
}

export function setCheckpoint(state, checkpoint) {
  state.checkpoint = cloneVector(checkpoint.spawn);
  state.status = 'Checkpoint reached.';
}

export function respawnPlayer(state, reason = 'Respawned at checkpoint.') {
  state.player.position = cloneVector(state.checkpoint);
  state.player.previousY = state.player.position.y;
  state.player.velocity = { x: 0, y: 0, z: 0 };
  state.player.grounded = false;
  state.player.carriedBy = null;
  state.deaths += 1;
  state.status = reason;
  state.lastRespawnAt = state.elapsed;
}

export function resetDynamicEntities(state) {
  state.movingPlatforms.forEach((platform) => {
    platform.position = cloneVector(platform.basePosition);
    platform.previousPosition = cloneVector(platform.basePosition);
  });
  state.enemies.forEach((enemy) => {
    enemy.position = cloneVector(enemy.basePosition);
  });
}

export function markVictory(state) {
  if (state.won) {
    return;
  }
  state.won = true;
  state.phase = 'won';
  state.score += 500 + state.collectedCoinIds.size * 50;
  state.status = 'Victory! Restart to improve your run.';
}
