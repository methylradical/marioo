export const MAX_GROWTH_COINS = 10;

export function getGrowthStats(coins) {
  const normalized = Math.max(0, Math.min(coins, MAX_GROWTH_COINS)) / MAX_GROWTH_COINS;
  const power = Number((1 + normalized).toFixed(2));
  return {
    power,
    scale: Number((1 + normalized * 0.45).toFixed(3)),
    jumpMultiplier: Number((1 + normalized * 0.34).toFixed(3)),
    airMultiplier: Number((1 + normalized * 0.28).toFixed(3)),
  };
}

export function applyGrowthToPlayer(player, stats) {
  const footX = player.x + player.w / 2;
  const footY = player.y + player.h;
  player.scale = stats.scale;
  player.w = Number((25 * stats.scale).toFixed(3));
  player.h = Number((31 * stats.scale).toFixed(3));
  player.x = footX - player.w / 2;
  player.y = footY - player.h;
}

export function reduceGrowthCoins(coins, amount = 3) {
  return Math.max(0, coins - amount);
}

export function gainGrowthCoins(coins, source = 'coin') {
  if (source === 'coin') {
    return Math.min(MAX_GROWTH_COINS, coins);
  }
  const amount = source === 'stomp' ? 2 : 1;
  return Math.min(MAX_GROWTH_COINS, coins + amount);
}

export function resolveBodyHitGrowth(coins) {
  if (coins <= 0) {
    return { coins: 0, died: true };
  }
  return { coins: reduceGrowthCoins(coins), died: false };
}
