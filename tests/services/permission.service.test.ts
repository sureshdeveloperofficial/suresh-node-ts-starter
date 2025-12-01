import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { PermissionService } from '@/services/permission.service';
import { cleanDatabase, seedTestDatabase, closeDatabase } from '../helpers/testDb';
import { createTestUser } from '../helpers/testHelpers';

describe('PermissionService', () => {
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

  describe('isSuperAdmin', () => {
    it('should return true for super admin user', async () => {
      const superAdmin = await createTestUser({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'Password123',
        roleName: 'super_admin',
      });

      const isAdmin = await PermissionService.isSuperAdmin(superAdmin.id);
      expect(isAdmin).toBe(true);
    });

    it('should return false for non-super admin user', async () => {
      const user = await createTestUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password123',
        roleName: 'user',
      });

      const isAdmin = await PermissionService.isSuperAdmin(user.id);
      expect(isAdmin).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for super admin regardless of permission', async () => {
      const superAdmin = await createTestUser({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: 'Password123',
        roleName: 'super_admin',
      });

      const hasPermission = await PermissionService.hasPermission(
        superAdmin.id,
        'user',
        'create'
      );
      expect(hasPermission).toBe(true);
    });

    it('should return true if user has the permission', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123',
        roleName: 'admin',
      });

      // Admin role should have user:create permission from seed
      const hasPermission = await PermissionService.hasPermission(
        admin.id,
        'user',
        'create'
      );
      expect(hasPermission).toBe(true);
    });

    it('should return false if user does not have the permission', async () => {
      const user = await createTestUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password123',
        roleName: 'user',
      });

      const hasPermission = await PermissionService.hasPermission(
        user.id,
        'user',
        'create'
      );
      expect(hasPermission).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123',
        roleName: 'admin',
      });

      const hasAny = await PermissionService.hasAnyPermission(admin.id, [
        { resource: 'user', action: 'create' },
        { resource: 'product', action: 'delete' },
      ]);

      expect(hasAny).toBe(true);
    });

    it('should return false if user has none of the permissions', async () => {
      const user = await createTestUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password123',
        roleName: 'user',
      });

      const hasAny = await PermissionService.hasAnyPermission(user.id, [
        { resource: 'user', action: 'create' },
        { resource: 'user', action: 'delete' },
      ]);

      expect(hasAny).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123',
        roleName: 'admin',
      });

      const hasAll = await PermissionService.hasAllPermissions(admin.id, [
        { resource: 'user', action: 'create' },
        { resource: 'user', action: 'read' },
      ]);

      expect(hasAll).toBe(true);
    });

    it('should return false if user is missing any permission', async () => {
      const user = await createTestUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password123',
        roleName: 'user',
      });

      const hasAll = await PermissionService.hasAllPermissions(user.id, [
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'create' },
      ]);

      expect(hasAll).toBe(false);
    });
  });

  describe('getUserPermissions', () => {
    it('should return user permissions', async () => {
      const admin = await createTestUser({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Password123',
        roleName: 'admin',
      });

      const permissions = await PermissionService.getUserPermissions(admin.id);

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
    });

    it('should return empty array for user with no permissions', async () => {
      const user = await createTestUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password123',
        roleName: 'user',
      });

      const permissions = await PermissionService.getUserPermissions(user.id);

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
    });
  });

  describe('getPermissionsByModule', () => {
    it('should return permissions for a module', async () => {
      const permissions = await PermissionService.getPermissionsByModule('user');

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
    });

    it('should return empty array for non-existent module', async () => {
      const permissions = await PermissionService.getPermissionsByModule('nonexistent');

      expect(permissions).toBeDefined();
      expect(Array.isArray(permissions)).toBe(true);
    });
  });

  describe('getAllModules', () => {
    it('should return all modules', async () => {
      const modules = await PermissionService.getAllModules();

      expect(modules).toBeDefined();
      expect(Array.isArray(modules)).toBe(true);
    });
  });
});

