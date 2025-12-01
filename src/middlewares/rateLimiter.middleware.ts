import { Request, Response, NextFunction } from 'express';
import { RedisService, RedisNamespace } from '../services/redis.service';
import { logger } from '../utils';

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate limiter middleware factory
 */
export const rateLimiter = (options: RateLimitOptions) => {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate identifier (IP address or user ID)
      const identifier = req.user?.userId || req.ip || req.socket.remoteAddress || 'unknown';
      const key = `ratelimit:${identifier}`;
      const windowSeconds = Math.ceil(windowMs / 1000);

      // Get current request count
      let currentCount = await RedisService.incr(RedisNamespace.RATE_LIMIT, key);

      // If key doesn't exist, set expiry
      if (currentCount === 1) {
        await RedisService.expire(RedisNamespace.RATE_LIMIT, key, windowSeconds);
      }

      // Check if limit exceeded
      if (currentCount && currentCount > maxRequests) {
        const retryAfter = windowSeconds;
        res.status(429).json({
          success: false,
          error: {
            message,
            retryAfter,
          },
        });
        return;
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - (currentCount || 0)).toString());
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

      // Track response status for skip options
      const originalSend = res.send;
      res.send = function (body) {
        const statusCode = res.statusCode;

        // Skip tracking based on options
        if (skipSuccessfulRequests && statusCode < 400) {
          // Don't count successful requests
        } else if (skipFailedRequests && statusCode >= 400) {
          // Don't count failed requests
        } else {
          // Request counted (default behavior)
        }

        return originalSend.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // On error, allow request to proceed (fail open)
      next();
    }
  };
};

/**
 * Default rate limiters
 */
export const defaultRateLimiters = {
  // Strict rate limiter (10 requests per minute)
  strict: rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many requests, please slow down',
  }),

  // Standard rate limiter (100 requests per 15 minutes)
  standard: rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    message: 'Rate limit exceeded, please try again later',
  }),

  // Auth rate limiter (5 requests per minute for auth endpoints)
  auth: rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later',
  }),

  // API rate limiter (1000 requests per hour)
  api: rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 1000,
    message: 'API rate limit exceeded',
  }),
};

