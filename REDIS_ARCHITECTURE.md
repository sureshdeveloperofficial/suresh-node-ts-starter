# Redis Architecture & Scalability

This document describes the scalable Redis architecture implemented in this project.

## Overview

Redis is used throughout the application for:
- **Authentication** - Token storage and blacklisting
- **Caching** - Database query caching
- **Rate Limiting** - API request throttling
- **Session Management** - User session storage

## Architecture

### 1. Redis Service (`src/services/redis.service.ts`)

Core Redis service with namespaced key management:

```typescript
import { RedisService, RedisNamespace } from './services/redis.service';

// Set a value
await RedisService.set('namespace', 'key', 'value', 3600); // with TTL

// Get a value
const value = await RedisService.get('namespace', 'key');

// JSON operations
await RedisService.setJSON('namespace', 'key', { data: 'value' }, 3600);
const data = await RedisService.getJSON<MyType>('namespace', 'key');
```

**Features:**
- Automatic namespacing (`app:namespace:key`)
- JSON serialization/deserialization
- Pattern-based key deletion
- Graceful fallback when Redis is unavailable

### 2. Cache Service (`src/services/cache.service.ts`)

High-level caching layer for database queries:

```typescript
import { CacheService } from './services/cache.service';

// Cache user
await CacheService.cacheUser(userId, userData, 600); // 10 min TTL

// Get cached user
const user = await CacheService.getCachedUser<User>(userId);

// Invalidate cache
await CacheService.invalidateUser(userId);
```

**Features:**
- Automatic query hash generation
- User-specific caching
- List query caching
- Cache invalidation on updates

### 3. Session Service (`src/services/session.service.ts`)

Session management with Redis:

```typescript
import { SessionService } from './services/session.service';

// Create session
await SessionService.createSession(sessionId, {
  userId: '123',
  email: 'user@example.com',
  role: 'user',
});

// Get session
const session = await SessionService.getSession(sessionId);

// Delete session
await SessionService.deleteSession(sessionId);
```

### 4. Rate Limiting (`src/middlewares/rateLimiter.middleware.ts`)

Redis-based rate limiting:

```typescript
import { rateLimiter } from './middlewares/rateLimiter.middleware';

// Custom rate limiter
const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  message: 'Too many requests',
});

// Or use decorator
@RateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
})
```

## Redis Namespaces

All Redis keys are organized by namespace:

- `app:auth:*` - Authentication tokens and blacklists
- `app:cache:*` - General cache data
- `app:ratelimit:*` - Rate limiting counters
- `app:session:*` - User sessions
- `app:user:*` - User-specific cache

## Usage Examples

### Authentication

```typescript
// Auth service uses RedisService for token management
await RedisService.set(RedisNamespace.AUTH, `refresh_token:${userId}`, token, expiry);
await RedisService.set(RedisNamespace.AUTH, `blacklist:${token}`, '1', expiry);
```

### Caching Database Queries

```typescript
// UserService automatically caches queries
const users = await UserService.getUsers({ page: 1, limit: 10 });
// First call: hits database, caches result
// Subsequent calls: returns from cache
```

### Rate Limiting

```typescript
// Applied via decorator
@Controller('/api')
@RateLimit({ windowMs: 60000, maxRequests: 100 })
export class ApiController {
  // All routes rate limited
}
```

## Scalability Features

### 1. **Non-Blocking Redis Connection**
- Server starts even if Redis is unavailable
- Graceful degradation (features work without Redis)
- Automatic reconnection with backoff

### 2. **Key Namespacing**
- Prevents key collisions
- Easy to clear namespaces
- Organized key structure

### 3. **TTL Management**
- Automatic expiration
- Configurable per operation
- Prevents memory leaks

### 4. **Cache Invalidation**
- Automatic invalidation on updates
- Pattern-based bulk deletion
- Smart cache refresh

### 5. **Error Handling**
- Fail-open strategy (works without Redis)
- Comprehensive error logging
- No single point of failure

## Configuration

Environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-password  # Optional
```

## Performance Considerations

1. **Cache TTLs:**
   - User data: 10 minutes
   - List queries: 5 minutes
   - Tokens: 7 days (refresh), 15 minutes (access)

2. **Rate Limits:**
   - Auth endpoints: 5 requests/15min
   - Registration: 3 requests/minute
   - API endpoints: 100 requests/15min

3. **Memory Management:**
   - Automatic key expiration
   - Pattern-based cleanup
   - Namespace isolation

## Monitoring

Check Redis status:

```typescript
import { isRedisAvailable } from './config/redis';

if (isRedisAvailable()) {
  // Redis is ready
}
```

## Best Practices

1. **Always use namespaces** - Never use raw keys
2. **Set appropriate TTLs** - Prevent stale data
3. **Invalidate on updates** - Keep cache fresh
4. **Use JSON for complex data** - Leverage `setJSON`/`getJSON`
5. **Handle Redis unavailability** - Code should work without Redis

## Future Enhancements

- Redis Cluster support
- Cache warming strategies
- Advanced cache invalidation patterns
- Metrics and monitoring integration
- Distributed locking for critical sections

