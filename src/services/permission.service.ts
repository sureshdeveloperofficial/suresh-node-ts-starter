import { prisma } from '../config/database';
import { logger } from '../utils';

export interface PermissionCheck {
  userId: string;
  resource: string;
  action: string;
}

export interface ModulePermission {
  id?: string;
  name?: string;
  module: string;
  resource: string;
  action: string;
  description: string;
}

/**
 * Permission Service - Manages role-based permissions
 * Module-based scalable permission system with hierarchical roles
 */

// Super Admin role name - bypasses all permission checks
export const SUPER_ADMIN_ROLE = 'super_admin';

/**
 * Permission Service - Manages role-based permissions
 * Module-based scalable permission system
 */
export class PermissionService {
  /**
   * Check if user is super admin
   */
  static async isSuperAdmin(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
        },
      });

      return user?.role?.name === SUPER_ADMIN_ROLE;
    } catch (error) {
      logger.error('Super admin check error:', error);
      return false;
    }
  }

  /**
   * Check if user has a specific permission
   * Super admin bypasses all permission checks
   */
  static async hasPermission(
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    try {
      // Super admin has access to everything
      const isSuperAdmin = await this.isSuperAdmin(userId);
      if (isSuperAdmin) {
        return true;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.role) {
        return false;
      }

      // Check if user's role has the required permission
      const hasPermission = user.role.permissions.some(
        (rp: any) =>
          rp.permission.resource === resource && rp.permission.action === action
      );

      return hasPermission;
    } catch (error) {
      logger.error('Permission check error:', error);
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   * Super admin bypasses all checks
   */
  static async hasAnyPermission(
    userId: string,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    // Super admin has access to everything
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    for (const perm of permissions) {
      if (await this.hasPermission(userId, perm.resource, perm.action)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions
   * Super admin bypasses all checks
   */
  static async hasAllPermissions(
    userId: string,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<boolean> {
    // Super admin has access to everything
    if (await this.isSuperAdmin(userId)) {
      return true;
    }

    for (const perm of permissions) {
      if (!(await this.hasPermission(userId, perm.resource, perm.action))) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get all permissions for a user
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user || !user.role) {
        return [];
      }

      return user.role.permissions.map(
        (rp: any) => `${rp.permission.resource}:${rp.permission.action}`
      );
    } catch (error) {
      logger.error('Get user permissions error:', error);
      return [];
    }
  }

  /**
   * Get permissions by module
   */
  static async getPermissionsByModule(module: string): Promise<ModulePermission[]> {
    try {
      const permissions = await prisma.permission.findMany({
        where: {
          resource: module,
        },
        orderBy: {
          action: 'asc',
        },
      });

      return permissions.map((p: any) => ({
        id: p.id,
        name: p.name,
        module,
        resource: p.resource,
        action: p.action,
        description: p.description || '',
      }));
    } catch (error) {
      logger.error('Get permissions by module error:', error);
      return [];
    }
  }

  /**
   * Create permissions for a module
   */
  static async createModulePermissions(
    module: string,
    actions: string[],
    descriptions?: Record<string, string>
  ): Promise<void> {
    try {
      const permissions = actions.map((action) => ({
        name: `${module}:${action}`,
        resource: `${module}`,
        action,
        description: descriptions?.[action] || `${action} ${module}`,
      }));

      await Promise.all(
        permissions.map((perm) =>
          prisma.permission.upsert({
            where: { name: perm.name },
            update: {
              description: perm.description,
            },
            create: perm,
          })
        )
      );

      logger.info(`Created ${permissions.length} permissions for module: ${module}`);
    } catch (error) {
      logger.error('Create module permissions error:', error);
      throw error;
    }
  }

  /**
   * Assign permissions to a role
   */
  static async assignPermissionsToRole(
    roleName: string,
    permissions: Array<{ resource: string; action: string }>
  ): Promise<void> {
    try {
      const role = await prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!role) {
        throw new Error(`Role ${roleName} not found`);
      }

      for (const perm of permissions) {
        const permission = await prisma.permission.findUnique({
          where: {
            name: `${perm.resource}:${perm.action}`,
          },
        });

        if (permission) {
          await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: role.id,
              permissionId: permission.id,
            },
          });
        }
      }

      logger.info(`Assigned ${permissions.length} permissions to role: ${roleName}`);
    } catch (error) {
      logger.error('Assign permissions to role error:', error);
      throw error;
    }
  }

  /**
   * Get all modules
   */
  static async getAllModules(): Promise<string[]> {
    try {
      const permissions = await prisma.permission.findMany({
        select: {
          resource: true,
        },
        distinct: ['resource'],
      });

      return permissions.map((p: any) => p.resource);
    } catch (error) {
      logger.error('Get all modules error:', error);
      return [];
    }
  }
}

