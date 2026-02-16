/**
 * Simple in-memory rate limiter for serverless.
 * Tracks extraction counts per user per day and globally.
 *
 * Limits:
 * - 50 extractions per user per day (one full 40-page scan + headroom)
 * - 500 total extractions per day (across all users)
 *
 * Note: In-memory state resets on cold starts, so actual usage may
 * slightly exceed limits. For 50 users this is more than adequate.
 */

const PER_USER_DAILY_LIMIT = 50;
const GLOBAL_DAILY_LIMIT = 500;

// { date: "2025-01-15", users: { "uid123": 5 }, total: 42 }
let store = { date: "", users: {}, total: 0 };

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function resetIfNewDay() {
  const today = getToday();
  if (store.date !== today) {
    store = { date: today, users: {}, total: 0 };
  }
}

/**
 * Atomically check and record an extraction for a user.
 * This prevents race conditions where concurrent requests could
 * bypass the rate limit by checking before any recording happens.
 *
 * Returns { allowed: boolean, reason?: string, remaining: number }
 */
export function checkAndRecordExtraction(userId) {
  resetIfNewDay();

  if (store.total >= GLOBAL_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: "Daily extraction limit reached for all users. Try again tomorrow.",
      remaining: 0,
    };
  }

  const userCount = store.users[userId] || 0;
  if (userCount >= PER_USER_DAILY_LIMIT) {
    return {
      allowed: false,
      reason: `You've used all ${PER_USER_DAILY_LIMIT} extractions for today. Try again tomorrow.`,
      remaining: 0,
    };
  }

  // Atomically increment before returning — prevents race condition
  store.users[userId] = userCount + 1;
  store.total += 1;

  return {
    allowed: true,
    remaining: PER_USER_DAILY_LIMIT - userCount - 1,
  };
}
