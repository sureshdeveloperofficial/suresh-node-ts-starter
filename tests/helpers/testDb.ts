import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

/**
 * Get test database client
 * Uses TEST_DATABASE_URL if set, otherwise falls back to DATABASE_URL
 */
export function getTestDb(): PrismaClient {
  if (!prisma) {
    // Use test database URL if provided, otherwise use the main database URL
    // This allows tests to run against the same database if test_db doesn't exist
    const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    
    if (!dbUrl) {
      throw new Error(
        'Database URL not found. Please set TEST_DATABASE_URL or DATABASE_URL environment variable.'
      );
    }

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }
  return prisma;
}

/**
 * Clean test database
 */
export async function cleanDatabase(): Promise<void> {
  const db = getTestDb();
  
  // Delete in correct order to respect foreign key constraints
  await db.rolePermission.deleteMany();
  await db.permission.deleteMany();
  await db.user.deleteMany();
  await db.role.deleteMany();
}

/**
 * Seed test database with minimal data
 */
export async function seedTestDatabase(): Promise<{
  superAdminRole: any;
  adminRole: any;
  userRole: any;
}> {
  const db = getTestDb();

  // Create roles
  const superAdminRole = await db.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator',
    },
  });

  const adminRole = await db.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator',
    },
  });

  const userRole = await db.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular User',
    },
  });

  // Create permissions
  const userCreatePerm = await db.permission.upsert({
    where: { name: 'user:create' },
    update: {},
    create: {
      name: 'user:create',
      resource: 'user',
      action: 'create',
      description: 'Create users',
    },
  });

  const userReadPerm = await db.permission.upsert({
    where: { name: 'user:read' },
    update: {},
    create: {
      name: 'user:read',
      resource: 'user',
      action: 'read',
      description: 'Read users',
    },
  });

  // Assign permissions to roles
  await db.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: userCreatePerm.id,
      },
    },
    update: {},
    create: {
      roleId: adminRole.id,
      permissionId: userCreatePerm.id,
    },
  });

  await db.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: userReadPerm.id,
      },
    },
    update: {},
    create: {
      roleId: adminRole.id,
      permissionId: userReadPerm.id,
    },
  });

  return { superAdminRole, adminRole, userRole };
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

