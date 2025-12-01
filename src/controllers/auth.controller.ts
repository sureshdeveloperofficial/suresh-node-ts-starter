import { Response } from 'express';
import { Controller, Post, Body, Res, Req } from '../decorators';
import { Validate } from '../decorators/validate';
import { Auth } from '../decorators/auth';
import { RateLimit } from '../decorators/rateLimit';
import { sendSuccess, sendError } from '../utils';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validations';

@Controller('/auth')
@RateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20, // 20 requests per 15 minutes for all auth endpoints
  message: 'Too many authentication requests, please try again later',
})
export class AuthController {
  @Post('/register')
  @Validate(registerSchema)
  // @RateLimit({
  //   windowMs: 60 * 1000, // 1 minute
  //   maxRequests: 5, // 5 registrations per minute
  //   message: 'Too many registration attempts, please try again later',
  // })
  async register(@Body() body: any, @Req() req: any, @Res() res: Response) {
    try {
      const { name, email, password, age, roleName } = body;

      // Check if user is authenticated and has permission to assign roles
      let requestedByUserId: string | undefined;
      let canAssignRole = false;

      if (req.user?.userId) {
        const userId = req.user.userId;
        requestedByUserId = userId;
        
        // Check if authenticated user has user:create permission
        // Super admin and admin can assign any role
        canAssignRole = await PermissionService.hasPermission(
          userId,
          'user',
          'create'
        );
      }

      // If roleName is provided but user doesn't have permission
      if (roleName && !canAssignRole) {
        return sendError(
          res,
          'Insufficient permissions to assign roles. Only admins can assign specific roles.',
          403
        );
      }

      // If no roleName provided, default to 'user' (public registration)
      // If roleName provided and user has permission, use that role
      const registrationData = {
        name,
        email,
        password, // Plain password - will be hashed by AuthService
        age,
        ...(roleName && canAssignRole ? { roleName } : {}),
      };

      // AuthService.register handles password hashing internally
      const user = await AuthService.register(registrationData, requestedByUserId);

      return sendSuccess(res, { user }, 'User registered successfully', 201);
    } catch (error) {
      const err = error as Error;

      if (err.message.includes('already exists')) {
        return sendError(res, err.message, 409);
      }

      if (err.message.includes('permission') || err.message.includes('Insufficient')) {
        return sendError(res, err.message, 403);
      }

      if (err.message.includes('not found')) {
        return sendError(res, err.message, 404);
      }

      return sendError(res, err.message, 500);
    }
  }

  @Post('/login')
  @Validate(loginSchema)
  // @RateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   maxRequests: 5, // 5 login attempts per 15 minutes
  //   message: 'Too many login attempts, please try again later',
  // })
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const { email, password } = body;

      const result = await AuthService.login({ email, password });

      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 401);
    }
  }

  @Post('/refresh')
  @Validate(refreshTokenSchema)
  async refreshToken(@Body() body: any, @Res() res: Response) {
    try {
      const { refreshToken } = body;

      const tokens = await AuthService.refreshToken(refreshToken);

      return sendSuccess(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 401);
    }
  }

  @Post('/logout')
  @Auth()
  async logout(@Req() req: any, @Res() res: Response) {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.substring(7); // Remove 'Bearer ' prefix

      if (!req.user || !token) {
        return sendError(res, 'Unauthorized', 401);
      }

      await AuthService.logout(req.user.userId, token);

      return sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }

  @Post('/me')
  @Auth()
  async getCurrentUser(@Req() req: any, @Res() res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }

      const user = await AuthService.getUserById(req.user.userId);

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Get user permissions
      const permissions = await PermissionService.getUserPermissions(req.user.userId);

      return sendSuccess(
        res,
        { user, permissions, role: user.role },
        'User retrieved successfully'
      );
    } catch (error) {
      const err = error as Error;
      return sendError(res, err.message, 500);
    }
  }
}

