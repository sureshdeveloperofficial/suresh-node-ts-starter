import 'reflect-metadata';
import { RequestHandler } from 'express';
import { rateLimiter, RateLimitOptions } from '../middlewares/rateLimiter.middleware';
import { MIDDLEWARE_METADATA_KEY } from './controller';

/**
 * Rate limit decorator - applies rate limiting to route handlers
 */
export function RateLimit(options: RateLimitOptions) {
  return function (target: any, propertyKey?: string, _descriptor?: PropertyDescriptor) {
    const middleware = rateLimiter(options);
    
    if (propertyKey) {
      // Method-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, middleware],
        target,
        propertyKey
      );
    } else {
      // Class-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, middleware], target);
    }
  };
}

