export function createPlayer(x, y) {
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    w: 25,
    h: 31,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1,
    invulnerable: 0,
    jumpsUsed: 0,
  };
}

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function resolveHorizontal(player, solids) {
  for (const solid of solids) {
    if (!rectsOverlap(player, solid)) continue;
    if (player.vx > 0) {
      player.x = solid.x - player.w;
    } else if (player.vx < 0) {
      player.x = solid.x + solid.w;
    }
    player.vx = 0;
  }
}

export function resolveVertical(player, solids) {
  player.grounded = false;
  for (const solid of solids) {
    if (!rectsOverlap(player, solid)) continue;
    if (player.vy > 0 && player.prevY + player.h <= solid.y + 8) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
      player.jumpsUsed = 0;
    } else if (player.vy < 0 && player.prevY >= solid.y + solid.h - 8) {
      player.y = solid.y + solid.h;
      player.vy = 0;
    }
  }
}

export function tryJump(player, jumpSpeed) {
  if (!player.grounded) {
    return false;
  }

  player.vy = -jumpSpeed;
  player.grounded = false;
  player.jumpsUsed += 1;
  return true;
}

export function tryCoinJump(player, jumpSpeed, coinJumps) {
  if (player.grounded || coinJumps <= 0) {
    return { jumped: false, coinJumps };
  }
  player.vy = -jumpSpeed;
  player.grounded = false;
  player.jumpsUsed += 1;
  return { jumped: true, coinJumps: coinJumps - 1 };
}

export function stompedEnemy(player, enemy) {
  return player.vy > 0 && player.prevY + player.h <= enemy.y + 10 && rectsOverlap(player, enemy);
}

export function cloneLevel(level) {
  return {
    ...level,
    spawn: { ...level.spawn },
    flag: { ...level.flag },
    solids: level.solids.map((item) => ({ ...item })),
    coins: level.coins.map((item) => ({ ...item })),
    enemies: level.enemies.map((item) => ({ ...item })),
    moving: level.moving.map((item) => ({ ...item })),
    hazards: level.hazards.map((item) => ({ ...item })),
  };
}
