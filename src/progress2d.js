export const PROGRESS_KEY = 'jump-plumber-progress-v1';

export function createMemoryStore() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

export function getSavedLevel(store, levelCount) {
  const raw = Number.parseInt(store?.getItem(PROGRESS_KEY) ?? '0', 10);
  if (!Number.isFinite(raw)) return 0;
  return Math.max(0, Math.min(raw, Math.max(0, levelCount - 1)));
}

export function markLevelCleared(store, levelIndex, levelCount) {
  const current = getSavedLevel(store, levelCount);
  const next = Math.min(levelIndex + 1, Math.max(0, levelCount - 1));
  store?.setItem(PROGRESS_KEY, String(Math.max(current, next)));
}

export function resetProgress(store) {
  store?.removeItem(PROGRESS_KEY);
}
