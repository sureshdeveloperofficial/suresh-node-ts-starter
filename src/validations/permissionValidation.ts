import Joi from 'joi';

// Create permission validation schema
export const createPermissionSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Permission name is required',
    }),
    resource: Joi.string().required().messages({
      'string.empty': 'Resource is required',
    }),
    action: Joi.string().required().messages({
      'string.empty': 'Action is required',
    }),
    description: Joi.string().optional(),
  }),
};

// Update permission validation schema
export const updatePermissionSchema = {
  body: Joi.object({
    description: Joi.string().optional(),
  }),
};

// Get permission by ID validation schema
export const getPermissionByIdSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid permission ID format',
      'string.empty': 'Permission ID is required',
    }),
  }),
};

// Get permissions by module validation schema
export const getPermissionsByModuleSchema = {
  params: Joi.object({
    module: Joi.string().required().messages({
      'string.empty': 'Module name is required',
    }),
  }),
};

// Assign permissions to role validation schema
export const assignPermissionsToRoleSchema = {
  body: Joi.object({
    roleName: Joi.string().required().messages({
      'string.empty': 'Role name is required',
    }),
    permissions: Joi.array()
      .items(
        Joi.object({
          resource: Joi.string().required(),
          action: Joi.string().required(),
        })
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one permission is required',
        'array.base': 'Permissions must be an array',
      }),
  }),
};

// Get role permissions validation schema
export const getRolePermissionsSchema = {
  params: Joi.object({
    roleName: Joi.string().required().messages({
      'string.empty': 'Role name is required',
    }),
  }),
};

