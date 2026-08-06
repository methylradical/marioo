const TILE = 32;

function block(x, y, w = 1, h = 1, kind = 'ground') {
  return { x: x * TILE, y: y * TILE, w: w * TILE, h: h * TILE, kind };
}

function coin(x, y) {
  return { id: `coin-${x}-${y}`, x: x * TILE + 10, y: y * TILE + 8, w: 12, h: 12, collected: false };
}

function enemy(id, x, y, minX, maxX, speed = 55) {
  return { id, x: x * TILE, y: y * TILE, w: 26, h: 26, vx: speed, minX: minX * TILE, maxX: maxX * TILE, alive: true };
}

function platform(id, x, y, w, minX, maxX, speed = 70) {
  return { id, x: x * TILE, y: y * TILE, w: w * TILE, h: 16, vx: speed, minX: minX * TILE, maxX: maxX * TILE, kind: 'moving' };
}

function spike(x, y, w = 1) {
  return { id: `spike-${x}-${y}`, x: x * TILE, y: y * TILE + 14, w: w * TILE, h: 18, kind: 'spike' };
}

function water(x, y, w = 2) {
  return { id: `water-${x}-${y}`, x: x * TILE, y: y * TILE + 10, w: w * TILE, h: 22, kind: 'water' };
}

export const TILE_SIZE = TILE;
export const VIEW = { w: 960, h: 540 };

export const LEVELS = [
  {
    name: 'Meadow Start',
    theme: 'outdoor',
    spawn: { x: 64, y: 352 },
    width: 2304,
    sky: '#8fd8ff',
    solids: [
      block(0, 14, 16, 3), block(18, 14, 12, 3), block(34, 14, 16, 3), block(54, 14, 18, 3),
      block(7, 11, 3, 1, 'brick'), block(13, 9, 3, 1, 'brick'), block(24, 10, 4, 1, 'brick'),
      block(39, 11, 5, 1, 'brick'), block(49, 9, 4, 1, 'brick'),
    ],
    coins: [coin(8, 10), coin(14, 8), coin(25, 9), coin(40, 10), coin(50, 8), coin(61, 12)],
    enemies: [enemy('e1', 21, 13.18, 18, 29, 44)],
    moving: [],
    hazards: [water(31, 14, 2), spike(52, 13, 1)],
    flag: { x: 68 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Brick Run',
    theme: 'outdoor',
    spawn: { x: 64, y: 320 },
    width: 2752,
    sky: '#7ec8ff',
    solids: [
      block(0, 14, 10, 3), block(13, 14, 8, 3), block(25, 14, 10, 3), block(40, 14, 8, 3),
      block(53, 14, 14, 3), block(72, 14, 14, 3),
      block(9, 11, 3, 1, 'brick'), block(17, 9, 4, 1, 'brick'), block(30, 11, 4, 1, 'brick'),
      block(44, 10, 5, 1, 'brick'), block(58, 8, 4, 1, 'brick'), block(70, 11, 4, 1, 'brick'),
    ],
    coins: [coin(10, 10), coin(18, 8), coin(31, 10), coin(45, 9), coin(59, 7), coin(71, 10), coin(80, 12)],
    enemies: [enemy('e1', 42, 13.18, 40, 47, 48)],
    moving: [platform('m1', 35, 11, 4, 35, 40)],
    hazards: [spike(22, 13, 2), water(49, 14, 2), spike(69, 13, 1)],
    flag: { x: 83 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Sky Finish',
    theme: 'outdoor',
    spawn: { x: 64, y: 288 },
    width: 3072,
    sky: '#9ce4ff',
    solids: [
      block(0, 14, 8, 3), block(13, 13, 6, 3), block(24, 12, 6, 4), block(37, 14, 8, 3),
      block(51, 12, 6, 4), block(63, 14, 7, 3), block(76, 13, 7, 3), block(88, 14, 8, 3),
      block(10, 9, 3, 1, 'brick'), block(28, 8, 4, 1, 'brick'), block(54, 7, 4, 1, 'brick'), block(79, 9, 4, 1, 'brick'),
    ],
    coins: [coin(10, 8), coin(28, 7), coin(39, 12), coin(54, 6), coin(66, 12), coin(79, 8), coin(91, 12)],
    enemies: [enemy('e1', 65, 13.18, 63, 69, 52)],
    moving: [platform('m1', 31, 10, 4, 31, 36, 82), platform('m2', 70, 11, 4, 70, 75, 86)],
    hazards: [water(20, 14, 3), spike(47, 13, 2), water(58, 14, 2), spike(84, 12, 2)],
    flag: { x: 94 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Harbor Steps',
    theme: 'outdoor',
    spawn: { x: 64, y: 352 },
    width: 2816,
    sky: '#7bd6dc',
    solids: [
      block(0, 14, 18, 3), block(20, 14, 12, 3), block(35, 13, 12, 4), block(50, 14, 15, 3), block(70, 14, 18, 3),
      block(12, 10, 4, 1, 'brick'), block(28, 9, 5, 1, 'brick'), block(42, 8, 4, 1, 'brick'), block(61, 10, 5, 1, 'brick'),
    ],
    coins: [coin(12, 9), coin(16, 12), coin(29, 8), coin(43, 7), coin(56, 12), coin(62, 9), coin(76, 12), coin(83, 12)],
    enemies: [enemy('e1', 23, 13.18, 20, 31, 56), enemy('e2', 78, 13.18, 70, 87, 60)],
    moving: [platform('m1', 33, 11, 5, 33, 39, 58)],
    hazards: [water(18, 14, 2), spike(48, 13, 2), water(66, 14, 3)],
    flag: { x: 85 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Lantern Ridge',
    theme: 'outdoor',
    spawn: { x: 64, y: 320 },
    width: 3200,
    sky: '#b8b2ff',
    solids: [
      block(0, 14, 14, 3), block(17, 13, 12, 4), block(33, 14, 13, 3), block(50, 13, 12, 4),
      block(66, 14, 13, 3), block(84, 14, 16, 3),
      block(9, 9, 4, 1, 'brick'), block(24, 8, 5, 1, 'brick'), block(39, 10, 4, 1, 'brick'), block(57, 8, 5, 1, 'brick'), block(76, 10, 4, 1, 'brick'),
    ],
    coins: [coin(9, 8), coin(24, 7), coin(35, 12), coin(40, 9), coin(57, 7), coin(68, 12), coin(76, 9), coin(91, 12), coin(96, 12)],
    enemies: [enemy('e1', 20, 12.18, 17, 28, 62), enemy('e2', 89, 13.18, 84, 99, 68)],
    moving: [platform('m1', 30, 11, 5, 30, 34, 58), platform('m2', 62, 10, 5, 62, 66, 60)],
    hazards: [spike(15, 12, 2), water(47, 14, 2), spike(80, 13, 2)],
    flag: { x: 97 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Basement Entry',
    theme: 'basement',
    spawn: { x: 64, y: 352 },
    width: 2944,
    sky: '#1d2430',
    solids: [
      block(0, 14, 16, 3, 'stone'), block(18, 14, 14, 3, 'stone'), block(35, 13, 13, 4, 'stone'),
      block(52, 14, 16, 3, 'stone'), block(73, 14, 19, 3, 'stone'),
      block(10, 10, 5, 1, 'brick'), block(27, 9, 4, 1, 'brick'), block(44, 8, 5, 1, 'brick'), block(63, 10, 5, 1, 'brick'),
    ],
    coins: [coin(10, 9), coin(14, 9), coin(28, 8), coin(45, 7), coin(58, 12), coin(64, 9), coin(79, 12), coin(87, 12)],
    enemies: [enemy('e1', 22, 13.18, 18, 31, 76), enemy('e2', 80, 13.18, 73, 91, 84)],
    moving: [platform('m1', 33, 11, 5, 33, 38, 92)],
    hazards: [spike(16, 13, 2), water(32, 14, 3), spike(69, 13, 2)],
    flag: { x: 89 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Pipeworks Cellar',
    theme: 'basement',
    spawn: { x: 64, y: 320 },
    width: 3200,
    sky: '#23202e',
    solids: [
      block(0, 14, 12, 3, 'stone'), block(15, 13, 12, 4, 'stone'), block(31, 14, 12, 3, 'stone'),
      block(47, 13, 12, 4, 'stone'), block(63, 14, 13, 3, 'stone'), block(82, 14, 18, 3, 'stone'),
      block(8, 9, 4, 1, 'brick'), block(22, 8, 5, 1, 'brick'), block(39, 10, 5, 1, 'brick'), block(55, 8, 5, 1, 'brick'), block(73, 10, 4, 1, 'brick'),
    ],
    coins: [coin(8, 8), coin(22, 7), coin(33, 12), coin(40, 9), coin(55, 7), coin(67, 12), coin(73, 9), coin(88, 12), coin(96, 12)],
    enemies: [enemy('e1', 18, 12.18, 15, 26, 88), enemy('e2', 66, 13.18, 63, 75, 92), enemy('e3', 90, 13.18, 82, 99, 96)],
    moving: [platform('m1', 28, 11, 5, 28, 32, 95), platform('m2', 77, 11, 5, 77, 82, 100)],
    hazards: [water(12, 14, 3), spike(44, 12, 2), water(59, 14, 3), spike(79, 13, 2)],
    flag: { x: 97 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Furnace Hall',
    theme: 'basement',
    spawn: { x: 64, y: 352 },
    width: 3328,
    sky: '#2c1d22',
    solids: [
      block(0, 14, 18, 3, 'stone'), block(21, 14, 12, 3, 'stone'), block(37, 13, 11, 4, 'stone'),
      block(53, 14, 14, 3, 'stone'), block(72, 13, 12, 4, 'stone'), block(88, 14, 16, 3, 'stone'),
      block(13, 9, 4, 1, 'brick'), block(29, 8, 4, 1, 'brick'), block(45, 9, 5, 1, 'brick'), block(61, 8, 4, 1, 'brick'), block(78, 9, 4, 1, 'brick'),
    ],
    coins: [coin(13, 8), coin(29, 7), coin(39, 12), coin(46, 8), coin(61, 7), coin(75, 12), coin(79, 8), coin(92, 12), coin(101, 12)],
    enemies: [enemy('e1', 24, 13.18, 21, 32, 94), enemy('e2', 56, 13.18, 53, 66, 100), enemy('e3', 94, 13.18, 88, 103, 104)],
    moving: [platform('m1', 34, 11, 4, 34, 38, 104), platform('m2', 68, 10, 5, 68, 72, 108)],
    hazards: [spike(18, 13, 2), water(33, 14, 3), spike(50, 12, 2), water(84, 13, 3)],
    flag: { x: 101 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Storage Vault',
    theme: 'basement',
    spawn: { x: 64, y: 320 },
    width: 3456,
    sky: '#1b2630',
    solids: [
      block(0, 14, 14, 3, 'stone'), block(17, 13, 13, 4, 'stone'), block(35, 14, 13, 3, 'stone'),
      block(52, 12, 10, 5, 'stone'), block(67, 14, 13, 3, 'stone'), block(85, 13, 13, 4, 'stone'), block(101, 14, 7, 3, 'stone'),
      block(8, 9, 4, 1, 'brick'), block(25, 8, 4, 1, 'brick'), block(42, 9, 5, 1, 'brick'), block(58, 7, 4, 1, 'brick'), block(75, 9, 5, 1, 'brick'), block(91, 8, 4, 1, 'brick'),
    ],
    coins: [coin(8, 8), coin(25, 7), coin(39, 12), coin(43, 8), coin(58, 6), coin(70, 12), coin(76, 8), coin(91, 7), coin(104, 12)],
    enemies: [enemy('e1', 20, 12.18, 17, 29, 104), enemy('e2', 70, 13.18, 67, 79, 108), enemy('e3', 90, 12.18, 85, 97, 112)],
    moving: [platform('m1', 31, 11, 5, 31, 35, 110), platform('m2', 63, 10, 5, 63, 67, 112), platform('m3', 97, 11, 4, 97, 101, 114)],
    hazards: [water(14, 14, 3), spike(49, 13, 2), water(80, 14, 3), spike(99, 12, 2)],
    flag: { x: 105 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
  {
    name: 'Deep Basement Exit',
    theme: 'basement',
    spawn: { x: 64, y: 352 },
    width: 3584,
    sky: '#181b28',
    solids: [
      block(0, 14, 18, 3, 'stone'), block(22, 13, 13, 4, 'stone'), block(40, 14, 12, 3, 'stone'),
      block(57, 13, 12, 4, 'stone'), block(74, 14, 13, 3, 'stone'), block(92, 13, 13, 4, 'stone'), block(108, 14, 4, 3, 'stone'),
      block(12, 9, 5, 1, 'brick'), block(31, 8, 4, 1, 'brick'), block(47, 9, 5, 1, 'brick'), block(64, 7, 4, 1, 'brick'), block(81, 9, 5, 1, 'brick'), block(99, 8, 4, 1, 'brick'),
    ],
    coins: [coin(12, 8), coin(31, 7), coin(43, 12), coin(48, 8), coin(64, 6), coin(77, 12), coin(82, 8), coin(99, 7), coin(110, 12)],
    enemies: [enemy('e1', 25, 12.18, 22, 34, 112), enemy('e2', 60, 12.18, 57, 68, 118), enemy('e3', 96, 12.18, 92, 104, 124)],
    moving: [platform('m1', 36, 11, 5, 36, 40, 116), platform('m2', 69, 10, 5, 69, 74, 118), platform('m3', 104, 11, 4, 104, 108, 120)],
    hazards: [spike(19, 13, 2), water(35, 14, 3), spike(53, 12, 2), water(88, 14, 3), spike(106, 13, 1)],
    flag: { x: 109 * TILE, y: 10 * TILE, w: 24, h: 128 },
  },
];

function isMainGround(solid) {
  return solid.y >= 12 * TILE && solid.w >= 4 * TILE;
}

function movingObjectsForGround(level, levelIndex) {
  const speedBase = 42 + levelIndex * 8;
  const maxPerSegment = levelIndex < 5 ? 2 : 3;
  return level.solids
    .filter(isMainGround)
    .flatMap((solid, segmentIndex) => {
      const count = solid.w >= 10 * TILE ? maxPerSegment : 2;
      const spacing = solid.w / (count + 1);
      return Array.from({ length: count }, (_, index) => {
        const x = (solid.x + spacing * (index + 1)) / TILE;
        const y = (solid.y - 26) / TILE;
        const minX = solid.x / TILE;
        const maxX = (solid.x + solid.w) / TILE;
        return enemy(`m${segmentIndex + 1}-${index + 1}`, x, y, minX, maxX, speedBase + segmentIndex * 5 + index * 4);
      });
    });
}

LEVELS.forEach((level, index) => {
  level.enemies = movingObjectsForGround(level, index);
});
