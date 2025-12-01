import Joi from 'joi';

// User creation validation schema
export const createUserSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 50 characters',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),
    age: Joi.number().integer().min(18).max(120).optional().messages({
      'number.min': 'Age must be at least 18',
      'number.max': 'Age must not exceed 120',
    }),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')).required().messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    }),
  }),
};

// User update validation schema
export const updateUserSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    age: Joi.number().integer().min(18).max(120).optional(),
  }),
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid user ID format',
    }),
  }),
};

// Get user by ID validation schema
export const getUserByIdSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Invalid user ID format',
    }),
  }),
};

// Query parameters validation schema
export const getUserListSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1).optional(),
    limit: Joi.number().integer().min(1).max(100).default(10).optional(),
    search: Joi.string().min(1).max(100).optional(),
    sortBy: Joi.string().valid('name', 'email', 'createdAt').optional(),
    order: Joi.string().valid('asc', 'desc').default('asc').optional(),
  }),
};

