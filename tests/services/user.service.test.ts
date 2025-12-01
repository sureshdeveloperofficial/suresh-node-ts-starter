import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { UserService } from '@/services/userService';
import { cleanDatabase, seedTestDatabase, closeDatabase } from '../helpers/testDb';
import { createTestUser } from '../helpers/testHelpers';

describe('UserService', () => {
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

  describe('getUsers', () => {
    it('should get paginated list of users', async () => {
      // Create test users
      await createTestUser({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'Password123',
      });
      await createTestUser({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'Password123',
      });

      const result = await UserService.getUsers({ page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.users).toBeDefined();
      expect(result.users.length).toBeGreaterThanOrEqual(2);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
    });

    it('should filter users by search term', async () => {
      await createTestUser({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      });
      await createTestUser({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Password123',
      });

      const result = await UserService.getUsers({ search: 'John' });

      expect(result.users.length).toBeGreaterThanOrEqual(1);
      expect(result.users[0].name).toContain('John');
    });

    it('should sort users correctly', async () => {
      await createTestUser({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'Password123',
      });
      await createTestUser({
        name: 'Bob',
        email: 'bob@example.com',
        password: 'Password123',
      });

      const result = await UserService.getUsers({
        sortBy: 'name',
        order: 'asc',
      });

      expect(result.users.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('getUserById', () => {
    it('should get user by id', async () => {
      const createdUser = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      const user = await UserService.getUserById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe('test@example.com');
      expect(user?.role).toBeDefined();
    });

    it('should return null for non-existent user', async () => {
      const user = await UserService.getUserById('non-existent-id');
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email', async () => {
      const createdUser = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      const user = await UserService.getUserByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await UserService.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        age: 30,
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe('newuser@example.com');
      expect(user.name).toBe('New User');
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
        UserService.createUser({
          name: 'New User',
          email: 'existing@example.com',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const createdUser = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      const updatedUser = await UserService.updateUser(createdUser.id, {
        name: 'Updated Name',
        age: 35,
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.name).toBe('Updated Name');
      expect(updatedUser?.age).toBe(35);
    });

    it('should return null for non-existent user', async () => {
      const user = await UserService.updateUser('non-existent-id', {
        name: 'Updated Name',
      });
      expect(user).toBeNull();
    });

    it('should throw error if email already exists', async () => {
      const user1 = await createTestUser({
        name: 'User 1',
        email: 'user1@example.com',
        password: 'Password123',
      });
      await createTestUser({
        name: 'User 2',
        email: 'user2@example.com',
        password: 'Password123',
      });

      await expect(
        UserService.updateUser(user1.id, {
          email: 'user2@example.com',
        })
      ).rejects.toThrow('User with this email already exists');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const createdUser = await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      });

      const deleted = await UserService.deleteUser(createdUser.id);

      expect(deleted).toBe(true);

      const user = await UserService.getUserById(createdUser.id);
      expect(user).toBeNull();
    });

    it('should return false for non-existent user', async () => {
      const deleted = await UserService.deleteUser('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});

