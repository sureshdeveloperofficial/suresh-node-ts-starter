import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { cleanDatabase, seedTestDatabase, closeDatabase } from '../helpers/testDb';
import { createTestUser, generateTestToken } from '../helpers/testHelpers';

describe('AuthService', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await seedTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        age: 25,
      };

      const user = await AuthService.register(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBeDefined();
      expect(user.role.name).toBe('user');
    });

    it('should throw error if user already exists', async () => {
      await createTestUser({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123',
      });

      await expect(
        AuthService.register({
          name: 'New User',
          email: 'existing@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('User with this email already exists');
    });

    it('should assign default user role if no role specified', async () => {
      const user = await AuthService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      });

      expect(user.role.name).toBe('user');
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const password = 'TestPassword123';
      await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password,
      });

      const result = await AuthService.login({
        email: 'test@example.com',
        password,
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw error with incorrect password', async () => {
      await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'CorrectPassword123',
      });

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'WrongPassword123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        AuthService.login({
          email: 'nonexistent@example.com',
          password: 'Password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const user = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      const token = generateTestToken({
        userId: user.id,
        email: user.email,
        role: user.role.name,
      });

      const payload = await AuthService.verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(user.id);
      expect(payload.email).toBe(user.email);
    });

    it('should throw error for invalid token', async () => {
      await expect(
        AuthService.verifyToken('invalid-token')
      ).rejects.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const user = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      // First login to get refresh token
      const loginResult = await AuthService.login({
        email: 'test@example.com',
        password: 'Password123',
      });

      const newTokens = await AuthService.refreshToken(
        loginResult.tokens.refreshToken
      );

      expect(newTokens).toBeDefined();
      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(
        AuthService.refreshToken('invalid-refresh-token')
      ).rejects.toThrow();
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const createdUser = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      const user = await AuthService.getUserById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe('test@example.com');
      expect(user?.role).toBeDefined();
    });

    it('should return null for non-existent user', async () => {
      const user = await AuthService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });
});

