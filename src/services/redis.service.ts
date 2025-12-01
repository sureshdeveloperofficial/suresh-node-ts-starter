import { getRedisClient, isRedisAvailable } from '../config/redis';
import { logger } from '../utils';

/**
 * Redis Service - Scalable Redis operations with namespacing
 * Provides organized access to Redis with proper key management
 */
export class RedisService {
  private static readonly KEY_PREFIX = 'app';
  private static readonly SEPARATOR = ':';

  /**
   * Build namespaced key
   */
  private static buildKey(namespace: string, key: string): string {
    return `${this.KEY_PREFIX}${this.SEPARATOR}${namespace}${this.SEPARATOR}${key}`;
  }

  /**
   * Check if Redis is available
   */
  private static checkRedis(): boolean {
    if (!isRedisAvailable()) {
      logger.warn('Redis not available, operation skipped');
      return false;
    }
    return true;
  }

  // ==================== Generic Operations ====================

  /**
   * Set a value with expiry
   */
  static async set(
    namespace: string,
    key: string,
    value: string,
    expirySeconds?: number
  ): Promise<boolean> {
    if (!this.checkRedis()) return false;

    try {
      const redis = getRedisClient();
      if (!redis) return false;

      const fullKey = this.buildKey(namespace, key);
      if (expirySeconds) {
        await redis.setEx(fullKey, expirySeconds, value);
      } else {
        await redis.set(fullKey, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  /**
   * Get a value
   */
  static async get(namespace: string, key: string): Promise<string | null> {
    if (!this.checkRedis()) return null;

    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const fullKey = this.buildKey(namespace, key);
      return await redis.get(fullKey);
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Delete a key
   */
  static async del(namespace: string, key: string): Promise<boolean> {
    if (!this.checkRedis()) return false;

    try {
      const redis = getRedisClient();
      if (!redis) return false;

      const fullKey = this.buildKey(namespace, key);
      await redis.del(fullKey);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delByPattern(namespace: string, pattern: string): Promise<number> {
    if (!this.checkRedis()) return 0;

    try {
      const redis = getRedisClient();
      if (!redis) return 0;

      const fullPattern = this.buildKey(namespace, pattern);
      const keys = await redis.keys(fullPattern);
      
      if (keys.length === 0) return 0;

      return await redis.del(keys);
    } catch (error) {
      logger.error('Redis delByPattern error:', error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(namespace: string, key: string): Promise<boolean> {
    if (!this.checkRedis()) return false;

    try {
      const redis = getRedisClient();
      if (!redis) return false;

      const fullKey = this.buildKey(namespace, key);
      const result = await redis.exists(fullKey);
      return result > 0;
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Set expiry on existing key
   */
  static async expire(namespace: string, key: string, seconds: number): Promise<boolean> {
    if (!this.checkRedis()) return false;

    try {
      const redis = getRedisClient();
      if (!redis) return false;

      const fullKey = this.buildKey(namespace, key);
      const result = await redis.expire(fullKey, seconds);
      return result === 1; // Convert number (1 or 0) to boolean
    } catch (error) {
      logger.error('Redis expire error:', error);
      return false;
    }
  }

  /**
   * Increment a value
   */
  static async incr(namespace: string, key: string): Promise<number | null> {
    if (!this.checkRedis()) return null;

    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const fullKey = this.buildKey(namespace, key);
      return await redis.incr(fullKey);
    } catch (error) {
      logger.error('Redis incr error:', error);
      return null;
    }
  }

  /**
   * Increment by value
   */
  static async incrBy(namespace: string, key: string, value: number): Promise<number | null> {
    if (!this.checkRedis()) return null;

    try {
      const redis = getRedisClient();
      if (!redis) return null;

      const fullKey = this.buildKey(namespace, key);
      return await redis.incrBy(fullKey, value);
    } catch (error) {
      logger.error('Redis incrBy error:', error);
      return null;
    }
  }

  // ==================== JSON Operations ====================

  /**
   * Set JSON value
   */
  static async setJSON<T>(
    namespace: string,
    key: string,
    value: T,
    expirySeconds?: number
  ): Promise<boolean> {
    const jsonString = JSON.stringify(value);
    return this.set(namespace, key, jsonString, expirySeconds);
  }

  /**
   * Get JSON value
   */
  static async getJSON<T>(namespace: string, key: string): Promise<T | null> {
    const value = await this.get(namespace, key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Redis JSON parse error:', error);
      return null;
    }
  }

  // ==================== Namespace Operations ====================

  /**
   * Clear all keys in a namespace
   */
  static async clearNamespace(namespace: string): Promise<number> {
    return this.delByPattern(namespace, '*');
  }

  /**
   * Get all keys in a namespace
   */
  static async getKeys(namespace: string, pattern: string = '*'): Promise<string[]> {
    if (!this.checkRedis()) return [];

    try {
      const redis = getRedisClient();
      if (!redis) return [];

      const fullPattern = this.buildKey(namespace, pattern);
      const keys = await redis.keys(fullPattern);
      
      // Remove prefix from keys
      const prefix = this.buildKey(namespace, '');
      return keys.map(key => key.replace(prefix, ''));
    } catch (error) {
      logger.error('Redis getKeys error:', error);
      return [];
    }
  }
}

/**
 * Redis Namespaces - Organized key management
 */
export const RedisNamespace = {
  AUTH: 'auth',
  CACHE: 'cache',
  RATE_LIMIT: 'ratelimit',
  SESSION: 'session',
  USER: 'user',
} as const;

