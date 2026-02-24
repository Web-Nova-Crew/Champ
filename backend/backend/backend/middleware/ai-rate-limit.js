const rateLimit = require('express-rate-limit');

/**
 * AI-specific rate limiting middleware
 * Protects free AI models from abuse
 */

// Store user request counts in memory (use Redis in production)
const userRequestCounts = new Map();
const userLastRequest = new Map();

// Daily limit per user
const DAILY_LIMIT = 50; // 50 AI messages per day per user
const COOLDOWN_MS = 5000; // 5 seconds between requests
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Reset daily counts periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, lastReset] of userRequestCounts.entries()) {
    if (now - lastReset > RESET_INTERVAL) {
      userRequestCounts.delete(userId);
    }
  }
}, 60 * 60 * 1000); // Check every hour

/**
 * Check if user has exceeded daily limit
 */
function checkDailyLimit(userId) {
  const userData = userRequestCounts.get(userId);
  
  if (!userData) {
    userRequestCounts.set(userId, {
      count: 1,
      firstRequest: Date.now(),
    });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  
  // Check if 24 hours have passed since first request
  const timeSinceFirst = Date.now() - userData.firstRequest;
  if (timeSinceFirst > RESET_INTERVAL) {
    // Reset counter
    userRequestCounts.set(userId, {
      count: 1,
      firstRequest: Date.now(),
    });
    return { allowed: true, remaining: DAILY_LIMIT - 1 };
  }
  
  // Check if limit exceeded
  if (userData.count >= DAILY_LIMIT) {
    const resetTime = new Date(userData.firstRequest + RESET_INTERVAL);
    return {
      allowed: false,
      remaining: 0,
      resetTime: resetTime.toISOString(),
    };
  }
  
  // Increment counter
  userData.count++;
  return {
    allowed: true,
    remaining: DAILY_LIMIT - userData.count,
  };
}

/**
 * Check cooldown between requests
 */
function checkCooldown(userId) {
  const lastRequest = userLastRequest.get(userId);
  
  if (!lastRequest) {
    userLastRequest.set(userId, Date.now());
    return { allowed: true };
  }
  
  const timeSinceLast = Date.now() - lastRequest;
  
  if (timeSinceLast < COOLDOWN_MS) {
    return {
      allowed: false,
      waitTime: Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000), // seconds
    };
  }
  
  userLastRequest.set(userId, Date.now());
  return { allowed: true };
}

/**
 * Middleware: Check user-based rate limits
 */
function aiUserRateLimit(req, res, next) {
  // Get user ID from auth token or IP address as fallback
  const userId = req.user?.id || req.ip;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'Unable to identify user for rate limiting',
    });
  }
  
  // Check cooldown
  const cooldownCheck = checkCooldown(userId);
  if (!cooldownCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Please wait ${cooldownCheck.waitTime} seconds before sending another message`,
      retryAfter: cooldownCheck.waitTime,
    });
  }
  
  // Check daily limit
  const limitCheck = checkDailyLimit(userId);
  if (!limitCheck.allowed) {
    return res.status(429).json({
      success: false,
      error: `Daily AI message limit (${DAILY_LIMIT}) reached. Resets at ${limitCheck.resetTime}`,
      resetTime: limitCheck.resetTime,
    });
  }
  
  // Add rate limit info to response headers
  res.setHeader('X-RateLimit-Limit', DAILY_LIMIT);
  res.setHeader('X-RateLimit-Remaining', limitCheck.remaining);
  
  next();
}

/**
 * IP-based rate limiting (backup protection)
 */
const aiIpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per 15 minutes per IP
  message: {
    success: false,
    error: 'Too many AI requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Get user's current rate limit status
 */
function getRateLimitStatus(userId) {
  const userData = userRequestCounts.get(userId);
  const lastRequest = userLastRequest.get(userId);
  
  if (!userData) {
    return {
      dailyLimit: DAILY_LIMIT,
      used: 0,
      remaining: DAILY_LIMIT,
      resetTime: new Date(Date.now() + RESET_INTERVAL).toISOString(),
    };
  }
  
  const timeSinceLast = lastRequest ? Date.now() - lastRequest : COOLDOWN_MS;
  
  return {
    dailyLimit: DAILY_LIMIT,
    used: userData.count,
    remaining: Math.max(0, DAILY_LIMIT - userData.count),
    resetTime: new Date(userData.firstRequest + RESET_INTERVAL).toISOString(),
    cooldownRemaining: Math.max(0, Math.ceil((COOLDOWN_MS - timeSinceLast) / 1000)),
  };
}

/**
 * Admin: Reset user's rate limit
 */
function resetUserLimit(userId) {
  userRequestCounts.delete(userId);
  userLastRequest.delete(userId);
}

/**
 * Admin: Get all rate limit stats
 */
function getAllStats() {
  return {
    totalUsers: userRequestCounts.size,
    dailyLimit: DAILY_LIMIT,
    cooldownSeconds: COOLDOWN_MS / 1000,
    users: Array.from(userRequestCounts.entries()).map(([userId, data]) => ({
      userId,
      count: data.count,
      firstRequest: new Date(data.firstRequest).toISOString(),
    })),
  };
}

module.exports = {
  aiUserRateLimit,
  aiIpRateLimit,
  getRateLimitStatus,
  resetUserLimit,
  getAllStats,
  DAILY_LIMIT,
  COOLDOWN_MS,
};

