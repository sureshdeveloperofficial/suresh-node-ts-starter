import 'reflect-metadata';
import { RequestHandler } from 'express';
import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../services/permission.service';
import { MIDDLEWARE_METADATA_KEY } from './controller';

export const PERMISSION_METADATA_KEY = Symbol('permission');

export interface PermissionRequirement {
  resource: string;
  action: string;
  requireAll?: boolean; // If true, requires all permissions; if false, requires any
}

/**
 * Permission decorator - applies permission-based authorization
 * Usage: @Permission({ resource: 'user', action: 'delete' })
 *        @Permission([{ resource: 'user', action: 'create' }, { resource: 'user', action: 'update' }], { requireAll: false })
 */
export function Permission(
  requirements: PermissionRequirement | PermissionRequirement[],
  options?: { requireAll?: boolean }
) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const permissions = Array.isArray(requirements) ? requirements : [requirements];
    const requireAll = options?.requireAll ?? false;

    const middleware: RequestHandler = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        if (!req.user) {
          res.status(401).json({
            success: false,
            error: {
              message: 'Authentication required',
            },
          });
          return;
        }

        const userId = req.user.userId;
        const userRole = req.user.role;

        // Super admin bypasses all permission checks
        if (userRole === 'super_admin') {
          next();
          return;
        }

        // Check permissions for other roles
        let hasPermission = false;
        if (requireAll) {
          hasPermission = await PermissionService.hasAllPermissions(userId, permissions);
        } else {
          hasPermission = await PermissionService.hasAnyPermission(userId, permissions);
        }

        if (!hasPermission) {
          res.status(403).json({
            success: false,
            error: {
              message: 'Insufficient permissions',
              required: permissions.map((p) => `${p.resource}:${p.action}`),
              role: userRole,
            },
          });
          return;
        }

        next();
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            message: 'Permission check failed',
          },
        });
      }
    };

    if (propertyKey) {
      // Method-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, middleware],
        target,
        propertyKey
      );
    } else {
      // Class-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, middleware], target);
    }
  };
}

/**
 * Helper decorators for common permission patterns
 * Auto-generated from MODULE_PERMISSIONS configuration
 */
const createModuleHelpers = (moduleName: string, actions: string[]) => {
  const helpers: any = {};
  
  actions.forEach((action) => {
    helpers[action] = () => Permission({ resource: moduleName, action });
  });
  
  // Add manage helper for modules with standard CRUD
  if (actions.includes('create') && actions.includes('read') && 
      actions.includes('update') && actions.includes('delete')) {
    helpers.manage = () =>
      Permission(
        [
          { resource: moduleName, action: 'create' },
          { resource: moduleName, action: 'read' },
          { resource: moduleName, action: 'update' },
          { resource: moduleName, action: 'delete' },
        ],
        { requireAll: false }
      );
  }
  
  return helpers;
};

// Import module permissions to generate helpers
import { MODULE_PERMISSIONS } from '../utils/modulePermissions';

export const Permissions: Record<string, any> = {};

// Generate helpers for all modules
for (const [moduleName, moduleConfig] of Object.entries(MODULE_PERMISSIONS)) {
  Permissions[moduleName] = createModuleHelpers(moduleName, moduleConfig.actions);
}

