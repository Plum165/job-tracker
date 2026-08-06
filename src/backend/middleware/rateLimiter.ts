import rateLimit from 'express-rate-limit';

/**
 * Standard API Rate Limiter
 * 300 requests per 15-minute window per IP
 */
export const globalApiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Global API rate limit exceeded. Please try again after 15 minutes.',
  },
});

/**
 * Strict Auth Rate Limiter
 * Protects login, signup, and token refresh endpoints against brute force attacks.
 * 20 requests per 15-minute window per IP.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Authentication rate limit exceeded. Too many attempts, please try again in 15 minutes.',
  },
});
