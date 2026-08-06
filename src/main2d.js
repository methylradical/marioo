import { LEVELS, VIEW } from './levels2d.js';
import { cloneLevel, createPlayer, rectsOverlap, resolveHorizontal, resolveVertical, stompedEnemy, tryCoinJump, tryJump } from './physics2d.js';
import { getSavedLevel, markLevelCleared, resetProgress } from './progress2d.js';
import { applyGrowthToPlayer, gainGrowthCoins, getGrowthStats, resolveBodyHitGrowth } from './growth2d.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const ui = {
  screen: document.querySelector('#screen'),
  title: document.querySelector('#screen-title'),
  text: document.querySelector('#screen-text'),
  start: document.querySelector('#start'),
  restart: document.querySelector('#restart'),
  newGame: document.querySelector('#new-game'),
  level: document.querySelector('#level'),
  score: document.querySelector('#score'),
  coins: document.querySelector('#coins'),
  power: document.querySelector('#power'),
  jumps: document.querySelector('#jumps'),
  lives: document.querySelector('#lives'),
  time: document.querySelector('#time'),
};

const keys = new Set();
const pressed = new Set();
const GRAVITY = 1650;
const MOVE_SPEED = 225;
const JUMP_SPEED = 665;
const START_LIVES = 3;

let mode = 'menu';
let levelIndex = 0;
let level = cloneLevel(LEVELS[0]);
let player = createPlayer(level.spawn.x, level.spawn.y);
let cameraX = 0;
let score = 0;
let lives = START_LIVES;
let totalCoins = 0;
let coinJumps = 0;
let elapsed = 0;
let lastTime = performance.now();

function resetAll() {
  levelIndex = getSavedLevel(localStorage, LEVELS.length);
  score = 0;
  totalCoins = 0;
  coinJumps = 0;
  lives = START_LIVES;
  loadLevel(levelIndex);
  mode = 'menu';
  showScreen('Jump Plumber', `Continue from stage ${levelIndex + 1}. Clear ${LEVELS.length} scenes and keep your progress after Game Over.`, 'Start');
}

function newAdventure() {
  resetProgress(localStorage);
  resetAll();
}

function loadLevel(index) {
  levelIndex = index;
  level = cloneLevel(LEVELS[levelIndex]);
  player = createPlayer(level.spawn.x, level.spawn.y);
  cameraX = 0;
  elapsed = 0;
}

function startGame() {
  if (mode === 'victory') {
    newAdventure();
  } else if (mode === 'gameover') {
    resetAll();
  }
  mode = 'playing';
  ui.screen.classList.add('hidden');
  lastTime = performance.now();
}

function showScreen(title, text, buttonText) {
  ui.title.textContent = title;
  ui.text.textContent = text;
  ui.start.textContent = buttonText;
  ui.screen.classList.remove('hidden');
}

function hurt() {
  if (player.invulnerable > 0) return;
  lives -= 1;
  if (lives <= 0) {
    mode = 'gameover';
    showScreen('Game Over', `Progress saved. Try stage ${levelIndex + 1} again. Score: ${score}`, 'Try Again');
    return;
  }
  player = createPlayer(level.spawn.x, level.spawn.y);
  applyGrowthToPlayer(player, getGrowthStats(totalCoins));
  player.invulnerable = 1.5;
}

function bodyHit() {
  if (player.invulnerable > 0) return;
  const result = resolveBodyHitGrowth(totalCoins);
  totalCoins = result.coins;
  if (result.died) {
    hurt();
    return;
  }
  applyGrowthToPlayer(player, getGrowthStats(totalCoins));
  player.invulnerable = 1.2;
}

function nextLevel() {
  score += Math.max(0, 500 - Math.floor(elapsed * 5));
  markLevelCleared(localStorage, levelIndex, LEVELS.length);
  if (levelIndex === LEVELS.length - 1) {
    mode = 'victory';
    showScreen('Course Clear', `Final score: ${score}. You cleared all ${LEVELS.length} scenes.`, 'New Adventure');
    return;
  }
  loadLevel(levelIndex + 1);
  mode = 'ready';
  showScreen(`Stage ${levelIndex + 1}`, LEVELS[levelIndex].name, 'Start Stage');
}

function update(dt) {
  if (mode !== 'playing') return;
  elapsed += dt;
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.prevX = player.x;
  player.prevY = player.y;

  const left = keys.has('ArrowLeft') || keys.has('KeyA');
  const right = keys.has('ArrowRight') || keys.has('KeyD');
  const jumpPressed = pressed.has('Space') || pressed.has('ArrowUp') || pressed.has('KeyW');
  const growth = getGrowthStats(totalCoins);
  player.vx = ((right ? MOVE_SPEED : 0) - (left ? MOVE_SPEED : 0)) * growth.airMultiplier;
  if (player.vx !== 0) player.facing = Math.sign(player.vx);
  if (jumpPressed) {
    if (!tryJump(player, JUMP_SPEED * growth.jumpMultiplier)) {
      const result = tryCoinJump(player, JUMP_SPEED * growth.jumpMultiplier, coinJumps);
      coinJumps = result.coinJumps;
    }
  }
  pressed.clear();

  updateMovingPlatforms(dt);
  const solids = [...level.solids, ...level.moving];

  player.x += player.vx * dt;
  resolveHorizontal(player, solids);
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;
  resolveVertical(player, solids);

  collectCoins();
  updateEnemies(dt);
  updateHazards();
  if (player.y > VIEW.h + 260) hurt();
  if (rectsOverlap(player, level.flag)) nextLevel();

  cameraX = Math.max(0, Math.min(level.width - VIEW.w, player.x - VIEW.w * 0.38));
}

function updateHazards() {
  for (const hazard of level.hazards) {
    if (rectsOverlap(player, hazard)) {
      hurt();
      return;
    }
  }
}

function updateMovingPlatforms(dt) {
  for (const p of level.moving) {
    p.x += p.vx * dt;
    if (p.x < p.minX || p.x + p.w > p.maxX) {
      p.vx *= -1;
      p.x = Math.max(p.minX, Math.min(p.x, p.maxX - p.w));
    }
  }
}

function updateEnemies(dt) {
  for (const enemy of level.enemies) {
    if (!enemy.alive) continue;
    enemy.x += enemy.vx * dt;
    if (enemy.x < enemy.minX || enemy.x + enemy.w > enemy.maxX) {
      enemy.vx *= -1;
    }
    if (!rectsOverlap(player, enemy)) continue;
    if (stompedEnemy(player, enemy)) {
      enemy.alive = false;
      player.vy = -420;
      totalCoins = gainGrowthCoins(totalCoins, 'stomp');
      applyGrowthToPlayer(player, getGrowthStats(totalCoins));
      score += 150;
    } else {
      bodyHit();
    }
  }
}

function collectCoins() {
  for (const coin of level.coins) {
    if (!coin.collected && rectsOverlap(player, coin)) {
      coin.collected = true;
      coinJumps += 1;
      score += 100;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawBackground();
  ctx.save();
  ctx.translate(-cameraX, 0);
  drawLevel();
  drawPlayer();
  ctx.restore();
  updateHud();
}

function drawBackground() {
  if (level.theme === 'basement') {
    drawBasementBackground();
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  gradient.addColorStop(0, level.sky);
  gradient.addColorStop(1, '#dff8e8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  for (let i = 0; i < 8; i += 1) {
    const x = (i * 180 - cameraX * 0.25) % (VIEW.w + 220) - 80;
    drawCloud(x, 72 + (i % 3) * 42);
  }
}

function drawBasementBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW.h);
  gradient.addColorStop(0, level.sky);
  gradient.addColorStop(1, '#11141c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);

  ctx.strokeStyle = 'rgba(255,255,255,.055)';
  ctx.lineWidth = 1;
  const offset = -Math.floor(cameraX * 0.18) % 64;
  for (let y = 0; y < VIEW.h; y += 32) {
    for (let x = offset - 64; x < VIEW.w + 64; x += 64) {
      ctx.strokeRect(x + (y % 64 === 0 ? 0 : 32), y, 64, 32);
    }
  }

  for (let i = 0; i < 6; i += 1) {
    const x = (i * 230 - cameraX * 0.4) % (VIEW.w + 260) - 80;
    const y = 80 + (i % 3) * 55;
    const light = ctx.createRadialGradient(x, y, 8, x, y, 96);
    light.addColorStop(0, 'rgba(255,190,86,.34)');
    light.addColorStop(1, 'rgba(255,190,86,0)');
    ctx.fillStyle = light;
    ctx.fillRect(x - 100, y - 100, 200, 200);
  }
}

function drawCloud(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.arc(x + 24, y - 12, 30, 0, Math.PI * 2);
  ctx.arc(x + 56, y, 24, 0, Math.PI * 2);
  ctx.fill();
}

function drawLevel() {
  for (const solid of level.solids) drawBlock(solid);
  for (const p of level.moving) drawRect(p.x, p.y, p.w, p.h, '#f2b84b', '#9b642a');
  for (const coin of level.coins) {
    if (coin.collected) continue;
    ctx.fillStyle = '#ffd447';
    ctx.beginPath();
    ctx.arc(coin.x + coin.w / 2, coin.y + coin.h / 2, 8 + Math.sin(elapsed * 8 + coin.x) * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9f7014';
    ctx.stroke();
  }
  for (const enemy of level.enemies) {
    if (!enemy.alive) continue;
    drawRect(enemy.x, enemy.y, enemy.w, enemy.h, '#c83e3a', '#6d1f22');
    ctx.fillStyle = '#111';
    ctx.fillRect(enemy.x + 6, enemy.y + 8, 4, 4);
    ctx.fillRect(enemy.x + 17, enemy.y + 8, 4, 4);
  }
  for (const hazard of level.hazards) {
    drawHazard(hazard);
  }
  drawFlag();
}

function drawHazard(hazard) {
  if (hazard.kind === 'water') {
    ctx.fillStyle = '#2496d8';
    ctx.fillRect(hazard.x, hazard.y, hazard.w, hazard.h);
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let x = hazard.x; x < hazard.x + hazard.w; x += 18) {
      ctx.fillRect(x, hazard.y + 5 + Math.sin(elapsed * 5 + x) * 3, 10, 3);
    }
    return;
  }

  ctx.fillStyle = '#6d5668';
  const count = Math.max(1, Math.floor(hazard.w / 16));
  for (let i = 0; i < count; i += 1) {
    const x = hazard.x + i * 16;
    ctx.beginPath();
    ctx.moveTo(x, hazard.y + hazard.h);
    ctx.lineTo(x + 8, hazard.y);
    ctx.lineTo(x + 16, hazard.y + hazard.h);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBlock(solid) {
  const fill = solid.kind === 'brick' ? '#b66a3c' : solid.kind === 'stone' ? '#59606c' : '#4caf63';
  const stroke = solid.kind === 'brick' ? '#753a24' : solid.kind === 'stone' ? '#2c3039' : '#2e7144';
  drawRect(solid.x, solid.y, solid.w, solid.h, fill, stroke);
  if (solid.kind === 'stone') {
    ctx.fillStyle = '#6d7584';
    ctx.fillRect(solid.x, solid.y, solid.w, 7);
  } else if (solid.kind !== 'brick') {
    ctx.fillStyle = '#63d276';
    ctx.fillRect(solid.x, solid.y, solid.w, 8);
  }
}

function drawFlag() {
  const flag = level.flag;
  ctx.fillStyle = '#f7f7f7';
  ctx.fillRect(flag.x + 4, flag.y, 6, flag.h);
  ctx.fillStyle = '#28a7a1';
  ctx.fillRect(flag.x + 10, flag.y + 10, 54, 30);
  ctx.fillStyle = '#f7d447';
  ctx.fillRect(flag.x - 8, flag.y + flag.h - 8, 30, 8);
}

function drawPlayer() {
  const flash = player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0;
  if (flash) return;
  const headH = 13 * (player.scale ?? 1);
  const capH = 8 * (player.scale ?? 1);
  drawRect(player.x, player.y + headH * 0.62, player.w, player.h - headH * 0.62, '#2f73d9', '#153c78');
  ctx.fillStyle = '#f2b179';
  ctx.fillRect(player.x + 4 * (player.scale ?? 1), player.y, player.w - 8 * (player.scale ?? 1), headH);
  ctx.fillStyle = '#d84636';
  ctx.fillRect(player.x + 2 * (player.scale ?? 1), player.y - capH * 0.62, player.w - 4 * (player.scale ?? 1), capH);
  ctx.fillStyle = '#ffe05a';
  ctx.fillRect(player.x + (player.facing > 0 ? player.w * 0.64 : player.w * 0.2), player.y + player.h * 0.5, 5 * (player.scale ?? 1), 8 * (player.scale ?? 1));
}

function drawRect(x, y, w, h, fill, stroke) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
}

function updateHud() {
  ui.level.textContent = `${levelIndex + 1}/${LEVELS.length}`;
  ui.score.textContent = score;
  ui.coins.textContent = `${level.coins.filter((coin) => coin.collected).length}/${level.coins.length}`;
  ui.power.textContent = `x${getGrowthStats(totalCoins).power.toFixed(1)}`;
  ui.jumps.textContent = coinJumps;
  ui.lives.textContent = lives;
  ui.time.textContent = elapsed.toFixed(1);
}

function loop(now) {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  if (!keys.has(event.code)) pressed.add(event.code);
  keys.add(event.code);
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
ui.start.addEventListener('click', startGame);
ui.restart.addEventListener('click', resetAll);
ui.newGame.addEventListener('click', newAdventure);

resetAll();
requestAnimationFrame(loop);
