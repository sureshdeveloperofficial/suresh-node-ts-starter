import { Response } from 'express';
import { Controller, Get, Post, Put, Delete, Body, Query, Param, Res } from '../decorators';
import { Validate } from '../decorators/validate';
import { Auth } from '../decorators/auth';
import { Permission } from '../decorators/permission';
import { RateLimit } from '../decorators/rateLimit';
import { sendSuccess, sendError } from '../utils';
import { UserService } from '../services';
import {
  createUserSchema,
  updateUserSchema,
  getUserByIdSchema,
  getUserListSchema,
} from '../validations';

@Controller('/users')
@Auth() // All routes in this controller require authentication
@RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later',
})
export class UserController {
  @Get('/')
  @Validate(getUserListSchema)
  @Permission({ resource: 'user', action: 'read' })
  async getUsers(@Query() query: any, @Res() res: Response) {
    try {
      const queryParams = {
        page: query.page ? Number(query.page) : undefined,
        limit: query.limit ? Number(query.limit) : undefined,
        search: query.search as string | undefined,
        sortBy: query.sortBy as 'name' | 'email' | 'createdAt' | undefined,
        order: query.order as 'asc' | 'desc' | undefined,
      };

      const result = await UserService.getUsers(queryParams);
      return sendSuccess(res, result, 'Users retrieved successfully');
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  @Get('/:id')
  @Validate(getUserByIdSchema)
  @Permission({ resource: 'user', action: 'read' })
  async getUserById(@Param('id') id: string, @Res() res: Response) {
    try {
      const user = await UserService.getUserById(id);

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  @Post('/')
  @Validate(createUserSchema)
  @Permission({ resource: 'user', action: 'create' })
  async createUser(@Body() body: any, @Res() res: Response) {
    try {
      const { name, email, age, password } = body;

      const newUser = await UserService.createUser({
        name,
        email,
        age,
        password, // In production, hash this before saving
      });

      return sendSuccess(res, newUser, 'User created successfully', 201);
    } catch (error) {
      const err = error as Error;

      // Handle duplicate email error
      if (err.message.includes('already exists')) {
        return sendError(res, err.message, 409);
      }

      return sendError(res, err.message, 500);
    }
  }

  @Put('/:id')
  @Validate(updateUserSchema)
  @Permission({ resource: 'user', action: 'update' })
  async updateUser(@Param('id') id: string, @Body() body: any, @Res() res: Response) {
    try {
      const updates = body;

      const updatedUser = await UserService.updateUser(id, updates);

      if (!updatedUser) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (error) {
      const err = error as Error;

      // Handle duplicate email error
      if (err.message.includes('already exists')) {
        return sendError(res, err.message, 409);
      }

      return sendError(res, err.message, 500);
    }
  }

  @Delete('/:id')
  @Validate(getUserByIdSchema)
  @Permission({ resource: 'user', action: 'delete' }) // Permission-based authorization
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    try {
      const deleted = await UserService.deleteUser(id);

      if (!deleted) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, { id }, 'User deleted successfully');
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }
}

