import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/database';
import { User } from './userService';
import { RedisService, RedisNamespace } from './redis.service';
import { PermissionService } from './permission.service';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  age?: number;
  roleName?: string; // Optional role name (only admins can set this)
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Hash password
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT tokens
   */
  static generateTokens(payload: TokenPayload): AuthTokens {
    const secret = config.jwt.secret;
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    const accessToken = jwt.sign(payload, secret, {
      expiresIn: config.jwt.accessTokenExpiry,
    } as SignOptions);

    const refreshToken = jwt.sign(payload, secret, {
      expiresIn: config.jwt.refreshTokenExpiry,
    } as SignOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): TokenPayload {
    try {
      const secret = config.jwt.secret;
      if (!secret) {
        throw new Error('JWT secret is not configured');
      }
      const decoded = jwt.verify(token, secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Store refresh token in Redis
   */
  static async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiry = 7 * 24 * 60 * 60; // 7 days in seconds
    await RedisService.set(
      RedisNamespace.AUTH,
      `refresh_token:${userId}`,
      refreshToken,
      expiry
    );
  }

  /**
   * Get refresh token from Redis
   */
  static async getRefreshToken(userId: string): Promise<string | null> {
    return await RedisService.get(RedisNamespace.AUTH, `refresh_token:${userId}`);
  }

  /**
   * Remove refresh token from Redis
   */
  static async removeRefreshToken(userId: string): Promise<void> {
    await RedisService.del(RedisNamespace.AUTH, `refresh_token:${userId}`);
  }

  /**
   * Store access token in Redis (for blacklisting)
   */
  static async blacklistToken(token: string, expiry: number): Promise<void> {
    await RedisService.set(RedisNamespace.AUTH, `blacklist:${token}`, '1', expiry);
  }

  /**
   * Check if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await RedisService.exists(RedisNamespace.AUTH, `blacklist:${token}`);
    return result;
  }

  /**
   * Register new user
   * @param data - Registration data
   * @param requestedByUserId - Optional: ID of user making the request (for permission check)
   */
  static async register(
    data: RegisterData,
    requestedByUserId?: string
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Determine which role to assign
    let roleToAssign = 'user'; // Default role

    // If roleName is provided, check if requester has permission to assign roles
    if (data.roleName) {
      if (!requestedByUserId) {
        throw new Error('Authentication required to assign specific roles');
      }

      // Check if requester has user:create permission
      const hasPermission = await PermissionService.hasPermission(
        requestedByUserId,
        'user',
        'create'
      );

      if (!hasPermission) {
        throw new Error('Insufficient permissions to assign roles');
      }

      // Verify the requested role exists
      const requestedRole = await prisma.role.findUnique({
        where: { name: data.roleName },
      });

      if (!requestedRole) {
        throw new Error(`Role '${data.roleName}' not found`);
      }

      roleToAssign = data.roleName;
    }

    // Get role to assign
    const role = await prisma.role.findUnique({
      where: { name: roleToAssign },
    });

    if (!role) {
      throw new Error(`Role '${roleToAssign}' not found. Please run seed script.`);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        age: data.age,
        roleId: role.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Login user
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user with role
    const user = await prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(credentials.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.name, // Use role name for JWT
    };

    const tokens = this.generateTokens(payload);

    // Store refresh token in Redis
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      roleId: user.roleId,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return {
      user: userWithoutPassword as User,
      tokens,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = this.verifyToken(refreshToken);

    // Check if refresh token exists in Redis (if available)
    const storedToken = await this.getRefreshToken(payload.userId);

    // If Redis is available, validate stored token
    if (storedToken !== null && storedToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const newTokens = this.generateTokens({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });

    // Update refresh token in Redis
    await this.storeRefreshToken(payload.userId, newTokens.refreshToken);

    return newTokens;
  }

  /**
   * Logout user
   */
  static async logout(userId: string, accessToken: string): Promise<void> {
    // Remove refresh token from Redis
    await this.removeRefreshToken(userId);

    // Blacklist access token (get remaining expiry)
    try {
      const decoded = jwt.decode(accessToken) as jwt.JwtPayload;
      if (decoded && decoded.exp) {
        const expiry = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiry > 0) {
          await this.blacklistToken(accessToken, expiry);
        }
      }
    } catch (error) {
      // Token might be invalid, ignore
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        age: true,
        roleId: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}

