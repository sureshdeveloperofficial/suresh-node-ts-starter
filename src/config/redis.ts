import { createClient, RedisClientType } from 'redis';
import { config } from './env';
import { logger } from '../utils';

// Redis client instance
let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection (non-blocking)
 * Returns null if connection fails, allowing server to start without Redis
 */
export async function initRedis(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: config.redis.url,
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.warn('Redis: Too many reconnection attempts, continuing without Redis');
            return false; // Stop reconnecting
          }
          return retries * 100;
        },
        connectTimeout: 5000, // 5 second timeout
      },
      ...(config.redis.password && { password: config.redis.password }),
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('🔌 Redis connecting...');
    });

    redisClient.on('ready', () => {
      logger.info('✅ Redis connected successfully');
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended');
    });

    // Try to connect with timeout
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      ),
    ]);

    return redisClient;
  } catch (error) {
    logger.warn('⚠️  Redis connection failed, continuing without Redis:', error);
    redisClient = null;
    return null;
  }
}

/**
 * Get Redis client instance
 * Returns null if Redis is not available
 */
export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return redisClient !== null;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

export default redisClient;

