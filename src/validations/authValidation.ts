import Joi from 'joi';

// Register validation schema
export const registerSchema = {
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
    password: Joi.string()
      .min(8)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      }),
    age: Joi.number().integer().min(18).max(120).optional().messages({
      'number.min': 'Age must be at least 18',
      'number.max': 'Age must not exceed 120',
    }),
    roleName: Joi.string()
      .valid('user', 'admin', 'employee', 'moderator', 'super_admin')
      .optional()
      .messages({
        'any.only': 'Invalid role name. Allowed values: user, admin, employee, moderator, super_admin',
      }),
  }),
};

// Login validation schema
export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  }),
};

// Refresh token validation schema
export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token is required',
    }),
  }),
};

