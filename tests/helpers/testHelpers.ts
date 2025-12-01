import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getTestDb } from './testDb';

/**
 * Create a test user
 */
export async function createTestUser(data: {
  name: string;
  email: string;
  password: string;
  roleName?: string;
  age?: number;
}) {
  const db = getTestDb();
  
  const role = await db.role.findUnique({
    where: { name: data.roleName || 'user' },
  });

  if (!role) {
    throw new Error(`Role ${data.roleName || 'user'} not found`);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await db.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      age: data.age,
      roleId: role.id,
      isActive: true,
    },
    include: {
      role: true,
    },
  });

  return user;
}

/**
 * Generate JWT token for testing
 */
export function generateTestToken(payload: {
  userId: string;
  email: string;
  role: string;
}): string {
  const secret = process.env.JWT_SECRET || 'test-secret';
  return jwt.sign(payload, secret, { expiresIn: '1h' });
}

/**
 * Generate refresh token for testing
 */
export function generateTestRefreshToken(payload: {
  userId: string;
  email: string;
}): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

/**
 * Create authenticated request headers
 */
export function getAuthHeaders(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock Redis client (for tests that don't need Redis)
 * Note: Import vi from vitest in your test files when using this
 */
export function createMockRedis() {
  // This function should be used in test files where vi is available as a global
  // For now, return a plain object that can be mocked
  return {
    get: () => Promise.resolve(null),
    set: () => Promise.resolve('OK'),
    del: () => Promise.resolve(1),
    exists: () => Promise.resolve(0),
    expire: () => Promise.resolve(1),
    incr: () => Promise.resolve(1),
  };
}

