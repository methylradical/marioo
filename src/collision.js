export function entityBounds(entity) {
  const half = {
    x: (entity.size?.x ?? entity.radius * 2 ?? 1) / 2,
    y: (entity.size?.y ?? entity.radius * 2 ?? 1) / 2,
    z: (entity.size?.z ?? entity.radius * 2 ?? 1) / 2,
  };
  return {
    min: {
      x: entity.position.x - half.x,
      y: entity.position.y - half.y,
      z: entity.position.z - half.z,
    },
    max: {
      x: entity.position.x + half.x,
      y: entity.position.y + half.y,
      z: entity.position.z + half.z,
    },
  };
}

export function sphereBounds(entity) {
  const radius = entity.radius ?? 0.5;
  return {
    min: { x: entity.position.x - radius, y: entity.position.y - radius, z: entity.position.z - radius },
    max: { x: entity.position.x + radius, y: entity.position.y + radius, z: entity.position.z + radius },
  };
}

export function intersectsAabb(a, b) {
  return a.min.x <= b.max.x && a.max.x >= b.min.x
    && a.min.y <= b.max.y && a.max.y >= b.min.y
    && a.min.z <= b.max.z && a.max.z >= b.min.z;
}

export function horizontalOverlap(a, b) {
  const aBounds = entityBounds(a);
  const bBounds = entityBounds(b);
  return aBounds.min.x <= bBounds.max.x && aBounds.max.x >= bBounds.min.x
    && aBounds.min.z <= bBounds.max.z && aBounds.max.z >= bBounds.min.z;
}

export function resolvePlatformLanding(player, platforms) {
  let landed = null;
  const playerBottom = player.position.y - player.size.y / 2;
  const previousBottom = player.previousY - player.size.y / 2;

  for (const platform of platforms) {
    const platformTop = platform.position.y + platform.size.y / 2;
    if (player.velocity.y > 0 || !horizontalOverlap(player, platform)) {
      continue;
    }
    const crossedTop = previousBottom >= platformTop && playerBottom <= platformTop + 0.12;
    const closeToTop = playerBottom >= platformTop - 0.18 && playerBottom <= platformTop + 0.35;
    if (crossedTop || closeToTop) {
      if (!landed || platformTop > landed.top) {
        landed = { platform, top: platformTop };
      }
    }
  }

  if (!landed) {
    player.grounded = false;
    player.carriedBy = null;
    return null;
  }

  player.position.y = Number((landed.top + player.size.y / 2).toFixed(4));
  player.velocity.y = 0;
  player.grounded = true;
  player.carriedBy = landed.platform.id;
  return landed;
}

export function findTouchedCoin(player, coins, collectedCoinIds = new Set()) {
  const playerBounds = entityBounds(player);
  return coins.find((coin) => !collectedCoinIds.has(coin.id) && intersectsAabb(playerBounds, sphereBounds(coin))) ?? null;
}

export function findTouchedEnemy(player, enemies) {
  const playerBounds = entityBounds(player);
  return enemies.find((enemy) => intersectsAabb(playerBounds, entityBounds(enemy))) ?? null;
}

export function findTouchedJumpPad(player, jumpPads) {
  const playerBounds = entityBounds(player);
  return jumpPads.find((pad) => intersectsAabb(playerBounds, entityBounds(pad))) ?? null;
}

export function findReachedCheckpoint(player, checkpoints) {
  const playerBounds = entityBounds(player);
  return checkpoints.find((checkpoint) => intersectsAabb(playerBounds, sphereBounds(checkpoint))) ?? null;
}

export function reachedFinish(player, finishGate) {
  return intersectsAabb(entityBounds(player), entityBounds(finishGate));
}
