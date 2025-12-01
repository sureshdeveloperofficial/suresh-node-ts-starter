import { RedisService, RedisNamespace } from './redis.service';
import { logger } from '../utils';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

/**
 * Cache Service - Provides caching layer for database queries
 */
export class CacheService {
  private static readonly DEFAULT_TTL = 300; // 5 minutes
  private static readonly DEFAULT_NAMESPACE = RedisNamespace.CACHE;

  /**
   * Generate cache key
   */
  private static generateKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Get cached value
   */
  static async get<T>(key: string, namespace: string = this.DEFAULT_NAMESPACE): Promise<T | null> {
    try {
      return await RedisService.getJSON<T>(namespace, key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached value
   */
  static async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const namespace = options.namespace || this.DEFAULT_NAMESPACE;
      const ttl = options.ttl || this.DEFAULT_TTL;
      return await RedisService.setJSON<T>(namespace, key, value, ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  static async del(key: string, namespace: string = this.DEFAULT_NAMESPACE): Promise<boolean> {
    try {
      return await RedisService.del(namespace, key);
    } catch (error) {
      logger.error('Cache del error:', error);
      return false;
    }
  }

  /**
   * Delete cached values by pattern
   */
  static async delPattern(
    pattern: string,
    namespace: string = this.DEFAULT_NAMESPACE
  ): Promise<number> {
    try {
      return await RedisService.delByPattern(namespace, pattern);
    } catch (error) {
      logger.error('Cache delPattern error:', error);
      return 0;
    }
  }

  /**
   * Cache user data
   */
  static async cacheUser(userId: string, userData: any, ttl: number = 600): Promise<boolean> {
    const key = this.generateKey('user', userId);
    return this.set(key, userData, { namespace: RedisNamespace.USER, ttl });
  }

  /**
   * Get cached user
   */
  static async getCachedUser<T>(userId: string): Promise<T | null> {
    const key = this.generateKey('user', userId);
    return this.get<T>(key, RedisNamespace.USER);
  }

  /**
   * Invalidate user cache
   */
  static async invalidateUser(userId: string): Promise<boolean> {
    const key = this.generateKey('user', userId);
    return this.del(key, RedisNamespace.USER);
  }

  /**
   * Cache user list query
   */
  static async cacheUserList(
    queryHash: string,
    data: any,
    ttl: number = 300
  ): Promise<boolean> {
    const key = this.generateKey('users', 'list', queryHash);
    return this.set(key, data, { ttl });
  }

  /**
   * Get cached user list
   */
  static async getCachedUserList<T>(queryHash: string): Promise<T | null> {
    const key = this.generateKey('users', 'list', queryHash);
    return this.get<T>(key);
  }

  /**
   * Invalidate all user list caches
   */
  static async invalidateUserList(): Promise<number> {
    return this.delPattern('users:list:*');
  }

  /**
   * Generate query hash for caching
   */
  static generateQueryHash(query: Record<string, any>): string {
    const sortedQuery = Object.keys(query)
      .sort()
      .reduce((acc, key) => {
        if (query[key] !== undefined && query[key] !== null) {
          acc[key] = query[key];
        }
        return acc;
      }, {} as Record<string, any>);

    return Buffer.from(JSON.stringify(sortedQuery)).toString('base64').slice(0, 32);
  }
}

