// User service for business logic using Prisma

import { prisma } from '../config/database';
import { CacheService } from './cache.service';

// Define User type excluding password for API responses
// Using Prisma's generated types
export type User = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  roleId: string;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface CreateUserData {
  name: string;
  email: string;
  age?: number;
  password?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  age?: number;
  password?: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface PaginatedUsers {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class UserService {
  /**
   * Get all users with pagination and filtering (with caching)
   */
  static async getUsers(query: UserListQuery): Promise<PaginatedUsers> {
    // Generate cache key from query
    const queryHash = CacheService.generateQueryHash(query);
    
    // Try to get from cache
    const cached = await CacheService.getCachedUserList<PaginatedUsers>(queryHash);
    if (cached) {
      return cached;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const search = query.search;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';

    // Build where clause for search
    // PostgreSQL supports case-insensitive mode
    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Build orderBy clause
    const orderBy: any = {
      [sortBy]: order,
    };

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
          // Exclude password from results
        },
      }),
      prisma.user.count({ where }),
    ]);

    const result: PaginatedUsers = {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the result (5 minutes TTL)
    await CacheService.cacheUserList(queryHash, result, 300);

    return result;
  }

  /**
   * Get user by ID (with caching)
   */
  static async getUserById(id: string): Promise<User | null> {
    // Try to get from cache
    const cached = await CacheService.getCachedUser<User>(id);
    if (cached) {
      return cached;
    }

    const user = await prisma.user.findUnique({
      where: { id },
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
        // Exclude password from results
      },
    });

    // Cache the user (10 minutes TTL)
    if (user) {
      await CacheService.cacheUser(id, user, 600);
    }

    return user;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
   * Create a new user
   */
  static async createUser(data: CreateUserData): Promise<User> {
    // Check if user with email already exists
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Get default 'user' role
    const defaultRole = await prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!defaultRole) {
      throw new Error('Default user role not found. Please run seed script.');
    }

    const newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        age: data.age,
        password: data.password || '', // Password is required in schema, provide default if not given
        roleId: defaultRole.id,
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
    }) as User;

    // Cache the new user
    await CacheService.cacheUser(newUser.id, newUser, 600);
    
    // Invalidate user list cache
    await CacheService.invalidateUserList();

    return newUser;
  }

  /**
   * Update user by ID
   */
  static async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return null;
    }

    // Check if email is being updated and if it already exists
    if (data.email) {
      const emailUser = await this.getUserByEmail(data.email);
      if (emailUser && emailUser.id !== id) {
        throw new Error('User with this email already exists');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.age !== undefined && { age: data.age }),
        ...(data.password && { password: data.password }), // In production, hash this
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

    // Invalidate cache
    await CacheService.invalidateUser(id);
    await CacheService.invalidateUserList();

    // Update cache with new data
    await CacheService.cacheUser(id, updatedUser, 600);

    return updatedUser;
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });

      // Invalidate cache
      await CacheService.invalidateUser(id);
      await CacheService.invalidateUserList();

      return true;
    } catch (error) {
      // User not found or other error
      return false;
    }
  }

  /**
   * Check if user exists
   */
  static async userExists(id: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  }
}
