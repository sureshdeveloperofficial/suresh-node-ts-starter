import { Response } from 'express';
import { Controller, Get, Post, Put, Delete, Body, Query, Param, Res, Req } from '../decorators';
import { Validate } from '../decorators/validate';
import { Auth } from '../decorators/auth';
import { Permission } from '../decorators/permission';
import { RateLimit } from '../decorators/rateLimit';
import { sendSuccess, sendError } from '../utils';
import { PermissionService } from '../services/permission.service';
import {
  createPermissionSchema,
  updatePermissionSchema,
  getPermissionByIdSchema,
  getPermissionsByModuleSchema,
  assignPermissionsToRoleSchema,
  getRolePermissionsSchema,
} from '../validations/permissionValidation';

@Controller('/permissions')
@Auth() // All routes require authentication
@RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests, please try again later',
})
export class PermissionController {
  /**
   * Get all permissions
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Get('/')
  @Permission({ resource: 'settings', action: 'read' }) // Only admins can view all permissions
  async getAllPermissions(@Query() _query: any, @Res() res: Response) {
    try {
      // Get all modules
      const modules = await PermissionService.getAllModules();

      // Get permissions for each module
      const permissionsByModule: Record<string, any[]> = {};
      for (const module of modules) {
        permissionsByModule[module] = await PermissionService.getPermissionsByModule(module);
      }

      return sendSuccess(
        res,
        {
          modules,
          permissions: permissionsByModule,
          totalModules: modules.length,
        },
        'Permissions retrieved successfully'
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Get permissions by module
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Get('/module/:module')
  @Validate(getPermissionsByModuleSchema)
  @Permission({ resource: 'permission', action: 'read' })
  async getPermissionsByModule(@Param('module') module: string, @Res() res: Response) {
    try {
      const permissions = await PermissionService.getPermissionsByModule(module);

      return sendSuccess(
        res,
        {
          module,
          permissions,
          count: permissions.length,
        },
        'Module permissions retrieved successfully'
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Get all modules
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Get('/modules')
  @Permission({ resource: 'permission', action: 'read' })
  async getAllModules(@Res() res: Response) {
    try {
      const modules = await PermissionService.getAllModules();

      return sendSuccess(
        res,
        {
          modules,
          count: modules.length,
        },
        'Modules retrieved successfully'
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Get user permissions
   * Any authenticated user can view their own permissions
   */
  @Get('/user')
  async getUserPermissions(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const permissions = await PermissionService.getUserPermissions(req.user.userId);

      return sendSuccess(
        res,
        {
          permissions,
          count: permissions.length,
        },
        'User permissions retrieved successfully'
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Get role permissions
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Get('/role/:roleName')
  @Validate(getRolePermissionsSchema)
  @Permission({ resource: 'permission', action: 'read' })
  async getRolePermissions(@Param('roleName') roleName: string, @Res() res: Response) {
    try {
      const { prisma } = await import('../config/database');
      
      const role = await prisma.role.findUnique({
        where: { name: roleName },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return sendError(res, 'Role not found', 404);
      }

      const permissions = role.permissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      }));

      return sendSuccess(
        res,
        {
          role: {
            id: role.id,
            name: role.name,
            description: role.description,
          },
          permissions,
          count: permissions.length,
        },
        'Role permissions retrieved successfully'
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Create permission for a module
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Post('/')
  @Validate(createPermissionSchema)
  @Permission({ resource: 'permission', action: 'create' })
  async createPermission(@Body() body: any, @Res() res: Response) {
    try {
      const { name, resource, action, description } = body;

      const { prisma } = await import('../config/database');

      // Check if permission already exists
      const existing = await prisma.permission.findUnique({
        where: { name },
      });

      if (existing) {
        return sendError(res, 'Permission already exists', 409);
      }

      const permission = await prisma.permission.create({
        data: {
          name,
          resource,
          action,
          description,
        },
      });

      return sendSuccess(res, { permission }, 'Permission created successfully', 201);
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Create permissions for a module (bulk)
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Post('/module/:module')
  @Permission({ resource: 'permission', action: 'create' })
  async createModulePermissions(@Param('module') module: string, @Body() body: any, @Res() res: Response) {
    try {
      const { actions, descriptions } = body;

      if (!actions || !Array.isArray(actions) || actions.length === 0) {
        return sendError(res, 'Actions array is required', 400);
      }

      await PermissionService.createModulePermissions(module, actions, descriptions);

      const permissions = await PermissionService.getPermissionsByModule(module);

      return sendSuccess(
        res,
        {
          module,
          permissions,
          count: permissions.length,
        },
        'Module permissions created successfully',
        201
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Assign permissions to role
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Post('/assign')
  @Validate(assignPermissionsToRoleSchema)
  @Permission({ resource: 'permission', action: 'assign' })
  async assignPermissionsToRole(@Body() body: any, @Res() res: Response) {
    try {
      const { roleName, permissions } = body;

      await PermissionService.assignPermissionsToRole(roleName, permissions);

      // Get updated role permissions
      const { prisma } = await import('../config/database');
      const role = await prisma.role.findUnique({
        where: { name: roleName },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return sendSuccess(
        res,
        {
          role: role?.name,
          assignedPermissions: permissions,
          totalPermissions: role?.permissions.length || 0,
        },
        'Permissions assigned to role successfully'
      );
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        return sendError(res, err.message, 404);
      }
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Update permission
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Put('/:id')
  @Validate(updatePermissionSchema)
  @Validate(getPermissionByIdSchema)
  @Permission({ resource: 'permission', action: 'update' })
  async updatePermission(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
    try {
      const { description } = body;

      const { prisma } = await import('../config/database');

      const permission = await prisma.permission.update({
        where: { id },
        data: {
          ...(description !== undefined && { description }),
        },
      });

      return sendSuccess(res, { permission }, 'Permission updated successfully');
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        return sendError(res, 'Permission not found', 404);
      }
      return sendError(res, err.message, 500);
    }
  }

  /**
   * Delete permission
   * Super Admin, Admin: ✅ | Others: ❌
   */
  @Delete('/:id')
  @Validate(getPermissionByIdSchema)
  @Permission({ resource: 'permission', action: 'delete' })
  async deletePermission(@Param('id') id: string, @Res() res: Response) {
    try {
      const { prisma } = await import('../config/database');

      await prisma.permission.delete({
        where: { id },
      });

      return sendSuccess(res, { id }, 'Permission deleted successfully');
    } catch (error) {
      const err = error as Error;
      if (err.message.includes('not found')) {
        return sendError(res, 'Permission not found', 404);
      }
      return sendError(res, err.message, 500);
    }
  }
}

