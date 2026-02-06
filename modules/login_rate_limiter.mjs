const attempts = new Map();

const maxAttempts = 5;
const waitTime = 10 /* <-minutes */ * 60 * 1000;

export function checkLoginRateLimit(key) {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) return true;

  if (now - entry.firstAttempt > waitTime) {
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