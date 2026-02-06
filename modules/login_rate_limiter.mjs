const attempts = new Map();

const maxAttempts = 5;
const windowsMs = 10 * 60 * 1000; // 10 min

export function checkLoginRateLimit(key) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) return true;

  if (now - entry.firstAttempt > windowsMs) {
    attempts.delete(key);
    return true;
  }

  return entry.count < maxAttempts;
}

export function registerFailedAttempt(key) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) {
    attempts.set(key, { count: 1, firstAttempt: now });
  } else {
    entry.count++;
  }
}

export function resetAttempts(key) {
  attempts.delete(key);
}