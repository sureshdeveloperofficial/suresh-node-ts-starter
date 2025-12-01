import { RedisService, RedisNamespace } from './redis.service';
import { logger } from '../utils';

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  ip?: string;
  userAgent?: string;
  createdAt: string;
  lastAccessed: string;
}

/**
 * Session Service - Manages user sessions in Redis
 */
export class SessionService {
  private static readonly SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
  private static readonly SESSION_NAMESPACE = RedisNamespace.SESSION;

  /**
   * Create a new session
   */
  static async createSession(
    sessionId: string,
    data: SessionData,
    ttl: number = this.SESSION_TTL
  ): Promise<boolean> {
    try {
      const sessionData: SessionData = {
        ...data,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      };
      return await RedisService.setJSON<SessionData>(
        this.SESSION_NAMESPACE,
        sessionId,
        sessionData,
        ttl
      );
    } catch (error) {
      logger.error('Session create error:', error);
      return false;
    }
  }

  /**
   * Get session data
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      return await RedisService.getJSON<SessionData>(this.SESSION_NAMESPACE, sessionId);
    } catch (error) {
      logger.error('Session get error:', error);
      return null;
    }
  }

  /**
   * Update session last accessed time
   */
  static async updateSessionAccess(sessionId: string, ttl: number = this.SESSION_TTL): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) return false;

      session.lastAccessed = new Date().toISOString();
      return await RedisService.setJSON<SessionData>(
        this.SESSION_NAMESPACE,
        sessionId,
        session,
        ttl
      );
    } catch (error) {
      logger.error('Session update error:', error);
      return false;
    }
  }

  /**
   * Delete session
   */
  static async deleteSession(sessionId: string): Promise<boolean> {
    try {
      return await RedisService.del(this.SESSION_NAMESPACE, sessionId);
    } catch (error) {
      logger.error('Session delete error:', error);
      return false;
    }
  }

  /**
   * Delete all sessions for a user
   */
  static async deleteUserSessions(userId: string): Promise<number> {
    try {
      // Get all sessions and filter by userId
      const keys = await RedisService.getKeys(this.SESSION_NAMESPACE, '*');
      let deleted = 0;

      for (const key of keys) {
        const session = await this.getSession(key);
        if (session && session.userId === userId) {
          await this.deleteSession(key);
          deleted++;
        }
      }

      return deleted;
    } catch (error) {
      logger.error('Delete user sessions error:', error);
      return 0;
    }
  }

  /**
   * Check if session exists
   */
  static async sessionExists(sessionId: string): Promise<boolean> {
    try {
      return await RedisService.exists(this.SESSION_NAMESPACE, sessionId);
    } catch (error) {
      logger.error('Session exists error:', error);
      return false;
    }
  }

  /**
   * Extend session TTL
   */
  static async extendSession(sessionId: string, ttl: number = this.SESSION_TTL): Promise<boolean> {
    try {
      return await RedisService.expire(this.SESSION_NAMESPACE, sessionId, ttl);
    } catch (error) {
      logger.error('Session extend error:', error);
      return false;
    }
  }
}

