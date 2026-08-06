import * as THREE from 'three';
import {
  collectCoin,
  createGameState,
  markVictory,
  resetDynamicEntities,
  respawnPlayer,
  setCheckpoint,
  startGame,
} from './game-state.js';
import {
  findReachedCheckpoint,
  findTouchedCoin,
  findTouchedEnemy,
  findTouchedJumpPad,
  reachedFinish,
  resolvePlatformLanding,
} from './collision.js';
import { DEFAULT_CAMERA_YAW, computeDesiredMove } from './input.js';

const root = document.querySelector('#scene-root');
const fallback = document.querySelector('#fallback');
const startScreen = document.querySelector('#start-screen');
const hud = {
  score: document.querySelector('#score'),
  coins: document.querySelector('#coins'),
  time: document.querySelector('#time'),
  deaths: document.querySelector('#deaths'),
  status: document.querySelector('#status'),
  start: document.querySelector('#start'),
  startPlay: document.querySelector('#start-play'),
  restart: document.querySelector('#restart'),
};

const keys = new Set();
const pointer = {
  dragging: false,
  x: 0,
  yaw: DEFAULT_CAMERA_YAW,
  pitch: 0.42,
};

let state = createGameState();
let renderer;
let scene;
let camera;
let playerGroup;
let clock;
let animationId;
const meshes = {
  platforms: new Map(),
  movingPlatforms: new Map(),
  coins: new Map(),
  enemies: new Map(),
  jumpPads: new Map(),
  checkpoints: new Map(),
};

const movement = {
  speed: 8.5,
  acceleration: 18,
  friction: 13,
  gravity: 27,
  jump: 11.5,
};

init();

function init() {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch {
    fallback.classList.add('visible');
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  root.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x82d9ff);
  scene.fog = new THREE.Fog(0x82d9ff, 35, 95);

  camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 160);
  clock = new THREE.Clock(false);

  addLights();
  buildWorld();
  bindInput();
  resetRun();

  window.addEventListener('resize', onResize);
  hud.start?.addEventListener('click', beginRun);
  hud.startPlay?.addEventListener('click', beginRun);
  hud.restart?.addEventListener('click', resetRun);
  animate();
}

function addLights() {
  scene.add(new THREE.HemisphereLight(0xeaf8ff, 0x6c8058, 2.4));

  const sun = new THREE.DirectionalLight(0xffffff, 2.6);
  sun.position.set(18, 28, 10);
  sun.castShadow = true;
  sun.shadow.camera.left = -45;
  sun.shadow.camera.right = 70;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -30;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
}

function buildWorld() {
  const grass = new THREE.MeshStandardMaterial({ color: 0x62c66e, roughness: 0.84 });
  const dirt = new THREE.MeshStandardMaterial({ color: 0x8a643e, roughness: 0.9 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffc83d, roughness: 0.36, metalness: 0.18 });
  const red = new THREE.MeshStandardMaterial({ color: 0xe94f37, roughness: 0.62 });
  const cyan = new THREE.MeshStandardMaterial({ color: 0x33c7d8, roughness: 0.42 });

  state.platforms.forEach((platform) => {
    const group = createIsland(platform, grass, dirt);
    scene.add(group);
    meshes.platforms.set(platform.id, group);
  });

  state.movingPlatforms.forEach((platform) => {
    const material = new THREE.MeshStandardMaterial({ color: platform.color, roughness: 0.62 });
    const mesh = createBox(platform.size, material);
    mesh.position.copy(vec(platform.position));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    meshes.movingPlatforms.set(platform.id, mesh);
  });

  state.coins.forEach((coin) => {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(coin.radius, 0.12, 10, 28), gold);
    mesh.position.copy(vec(coin.position));
    mesh.rotation.y = Math.PI / 2;
    mesh.castShadow = true;
    scene.add(mesh);
    meshes.coins.set(coin.id, mesh);
  });

  state.enemies.forEach((enemy) => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 1), red);
    body.scale.set(1.05, 0.82, 1.05);
    body.castShadow = true;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), new THREE.MeshStandardMaterial({ color: 0x26333d }));
    cap.position.set(0, 0.44, 0.38);
    group.add(body, cap);
    group.position.copy(vec(enemy.position));
    scene.add(group);
    meshes.enemies.set(enemy.id, group);
  });

  state.jumpPads.forEach((pad) => {
    const group = new THREE.Group();
    const base = createBox(pad.size, cyan);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.9, 0.18, 20), new THREE.MeshStandardMaterial({ color: 0xffdd58 }));
    top.position.y = pad.size.y / 2 + 0.12;
    top.castShadow = true;
    group.add(base, top);
    group.position.copy(vec(pad.position));
    scene.add(group);
    meshes.jumpPads.set(pad.id, group);
  });

  state.checkpoints.forEach((checkpoint) => {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.4, 10), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    pole.position.y = 1.1;
    const flag = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 0.08), new THREE.MeshStandardMaterial({ color: 0x33c7d8 }));
    flag.position.set(0.55, 1.75, 0);
    group.add(pole, flag);
    group.position.copy(vec(checkpoint.position));
    scene.add(group);
    meshes.checkpoints.set(checkpoint.id, group);
  });

  scene.add(createFinishGate());
  scene.add(createPlayer());
  addDecorations();
}

function createIsland(platform, grass, dirt) {
  const group = new THREE.Group();
  const top = createBox(platform.size, new THREE.MeshStandardMaterial({ color: platform.color ?? grass.color, roughness: 0.84 }));
  top.position.copy(vec(platform.position));
  top.castShadow = true;
  top.receiveShadow = true;

  const underside = new THREE.Mesh(
    new THREE.ConeGeometry(Math.max(platform.size.x, platform.size.z) * 0.42, 3.2, 6),
    dirt,
  );
  underside.position.set(platform.position.x, platform.position.y - platform.size.y / 2 - 1.55, platform.position.z);
  underside.rotation.y = Math.PI / 6;
  underside.castShadow = true;
  underside.receiveShadow = true;
  group.add(top, underside);
  return group;
}

function createBox(size, material) {
  return new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), material);
}

function createPlayer() {
  playerGroup = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2d7dd2, roughness: 0.52 });
  const vestMaterial = new THREE.MeshStandardMaterial({ color: 0xffcb45, roughness: 0.5 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xf1b07a, roughness: 0.6 });
  const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0xe94f37, roughness: 0.42 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 0.58, 4, 10), bodyMaterial);
  body.position.y = 0.15;
  body.castShadow = true;
  const vest = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.58, 0.2), vestMaterial);
  vest.position.set(0, 0.2, 0.32);
  vest.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 16, 12), skinMaterial);
  head.position.y = 0.86;
  head.castShadow = true;
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.39, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), helmetMaterial);
  helmet.position.y = 1.05;
  helmet.castShadow = true;
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), skinMaterial);
  nose.position.set(0, 0.86, 0.35);
  playerGroup.add(body, vest, head, helmet, nose);
  return playerGroup;
}

function createFinishGate() {
  const gate = state.finishGate;
  const group = new THREE.Group();
  const white = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.4 });
  const teal = new THREE.MeshStandardMaterial({ color: 0x1bb7a5, roughness: 0.44 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.18, gate.size.y, 0.18), white);
  const right = left.clone();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 0.2), teal);
  left.position.set(-0.8, 0, 0);
  right.position.set(0.8, 0, 0);
  top.position.set(0, gate.size.y / 2, 0);
  group.add(left, right, top);
  group.position.copy(vec(gate.position));
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });
  return group;
}

function addDecorations() {
  const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 });
  for (let i = 0; i < 9; i += 1) {
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j += 1) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(1.2 + j * 0.18, 10, 8), cloudMaterial);
      puff.position.set(j * 1.05, Math.sin(j) * 0.2, (j % 2) * 0.45);
      cloud.add(puff);
    }
    cloud.position.set(-8 + i * 9, 11 + (i % 3) * 2.5, -14 - (i % 4) * 5);
    cloud.scale.setScalar(0.85 + (i % 3) * 0.18);
    scene.add(cloud);
  }
}

function bindInput() {
  window.addEventListener('keydown', (event) => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
    }
    keys.add(event.code);
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });

  renderer.domElement.addEventListener('pointerdown', (event) => {
    pointer.dragging = true;
    pointer.x = event.clientX;
    renderer.domElement.setPointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener('pointermove', (event) => {
    if (!pointer.dragging) {
      return;
    }
    const delta = event.clientX - pointer.x;
    pointer.x = event.clientX;
    pointer.yaw -= delta * 0.006;
  });

  renderer.domElement.addEventListener('pointerup', (event) => {
    pointer.dragging = false;
    renderer.domElement.releasePointerCapture(event.pointerId);
  });
}

function resetRun() {
  state = createGameState();
  resetDynamicEntities(state);
  meshes.coins.forEach((mesh) => {
    mesh.visible = true;
  });
  if (clock) {
    clock.stop();
    clock.elapsedTime = 0;
  }
  startScreen?.classList.remove('hidden');
  updateHud();
}

function beginRun() {
  if (startGame(state)) {
    clock?.start();
    startScreen?.classList.add('hidden');
  }
  updateHud();
}

function animate() {
  animationId = requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.033);
  update(dt);
  renderer.render(scene, camera);
}

function update(dt) {
  if (state.phase === 'playing') {
    state.elapsed += dt;
    updateDynamicEntities(state.elapsed);
    updatePlayer(dt);
    updateInteractions();
  } else if (state.phase === 'won') {
    updateDynamicEntities(state.elapsed);
  }

  syncMeshes();
  updateCamera();
  updateHud();
}

function updateDynamicEntities(time) {
  state.movingPlatforms.forEach((platform) => {
    platform.previousPosition = { ...platform.position };
    const offset = Math.sin(time * platform.speed) * platform.amplitude;
    platform.position = { ...platform.basePosition, [platform.axis]: platform.basePosition[platform.axis] + offset };
  });

  state.enemies.forEach((enemy) => {
    const offset = Math.sin(time * enemy.speed) * enemy.amplitude;
    enemy.position = { ...enemy.basePosition, [enemy.axis]: enemy.basePosition[enemy.axis] + offset };
  });
}

function updatePlayer(dt) {
  const player = state.player;
  player.previousY = player.position.y;

  if (player.carriedBy) {
    const platform = state.movingPlatforms.find((item) => item.id === player.carriedBy);
    if (platform?.previousPosition) {
      player.position.x += platform.position.x - platform.previousPosition.x;
      player.position.z += platform.position.z - platform.previousPosition.z;
    }
  }

  const input = getMoveInput();
  const move = computeDesiredMove(pointer.yaw, input);
  const desired = new THREE.Vector3(move.x, 0, move.z);

  if (desired.lengthSq() > 0.001) {
    desired.normalize();
    player.yaw = Math.atan2(desired.x, desired.z);
    player.velocity.x += (desired.x * movement.speed - player.velocity.x) * Math.min(1, movement.acceleration * dt);
    player.velocity.z += (desired.z * movement.speed - player.velocity.z) * Math.min(1, movement.acceleration * dt);
  } else {
    player.velocity.x += (0 - player.velocity.x) * Math.min(1, movement.friction * dt);
    player.velocity.z += (0 - player.velocity.z) * Math.min(1, movement.friction * dt);
  }

  if (isJumpPressed() && player.grounded) {
    player.velocity.y = movement.jump;
    player.grounded = false;
    player.carriedBy = null;
  }

  player.velocity.y -= movement.gravity * dt;
  player.position.x += player.velocity.x * dt;
  player.position.y += player.velocity.y * dt;
  player.position.z += player.velocity.z * dt;

  const allPlatforms = [...state.platforms, ...state.movingPlatforms];
  resolvePlatformLanding(player, allPlatforms);

  const jumpPad = findTouchedJumpPad(player, state.jumpPads);
  if (jumpPad && player.velocity.y <= 0.2) {
    player.velocity.y = jumpPad.impulse;
    player.grounded = false;
    player.carriedBy = null;
    state.status = 'Spring boost!';
  }

  if (player.position.y < -8) {
    respawnPlayer(state, 'Fell into the clouds. Back to checkpoint.');
  }
}

function updateInteractions() {
  const coin = findTouchedCoin(state.player, state.coins, state.collectedCoinIds);
  if (coin && collectCoin(state, coin.id)) {
    const mesh = meshes.coins.get(coin.id);
    if (mesh) {
      mesh.visible = false;
    }
  }

  const checkpoint = findReachedCheckpoint(state.player, state.checkpoints);
  if (checkpoint && !samePoint(state.checkpoint, checkpoint.spawn)) {
    setCheckpoint(state, checkpoint);
  }

  const enemy = findTouchedEnemy(state.player, state.enemies);
  if (enemy && state.elapsed - state.lastRespawnAt > 0.8) {
    respawnPlayer(state, 'Tagged by a roller. Try the timing again.');
  }

  if (reachedFinish(state.player, state.finishGate)) {
    markVictory(state);
  }
}

function syncMeshes() {
  if (playerGroup) {
    playerGroup.position.copy(vec(state.player.position));
    playerGroup.rotation.y = state.player.yaw;
  }

  state.movingPlatforms.forEach((platform) => {
    meshes.movingPlatforms.get(platform.id)?.position.copy(vec(platform.position));
  });

  state.enemies.forEach((enemy) => {
    const mesh = meshes.enemies.get(enemy.id);
    if (mesh) {
      mesh.position.copy(vec(enemy.position));
      mesh.rotation.y += 0.045;
    }
  });

  state.coins.forEach((coin, index) => {
    const mesh = meshes.coins.get(coin.id);
    if (mesh) {
      mesh.rotation.z += 0.035 + index * 0.001;
      mesh.position.y = coin.position.y + Math.sin(state.elapsed * 2.4 + index) * 0.08;
    }
  });

  meshes.checkpoints.forEach((mesh) => {
    mesh.rotation.y = Math.sin(state.elapsed * 1.5) * 0.08;
  });
}

function updateCamera() {
  const target = vec(state.player.position);
  target.y += 0.6;
  const radius = 8.5;
  const height = 4.4;
  camera.position.set(
    target.x - Math.sin(pointer.yaw) * radius,
    target.y + height + Math.sin(pointer.pitch) * 1.5,
    target.z - Math.cos(pointer.yaw) * radius,
  );
  camera.lookAt(target);
}

function updateHud() {
  hud.score.textContent = String(state.score);
  hud.coins.textContent = `${state.collectedCoinIds.size}/${state.coins.length}`;
  hud.time.textContent = state.elapsed.toFixed(1);
  hud.deaths.textContent = String(state.deaths);
  hud.status.textContent = state.status;
  if (hud.start) {
    hud.start.disabled = state.phase !== 'ready';
  }
}

function getMoveInput() {
  const left = keys.has('KeyA') || keys.has('ArrowLeft') ? -1 : 0;
  const right = keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0;
  const forward = keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0;
  const back = keys.has('KeyS') || keys.has('ArrowDown') ? -1 : 0;
  return { x: left + right, z: forward + back };
}

function isJumpPressed() {
  return keys.has('Space');
}

function samePoint(a, b) {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}

function vec(position) {
  return new THREE.Vector3(position.x, position.y, position.z);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('beforeunload', () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
});
