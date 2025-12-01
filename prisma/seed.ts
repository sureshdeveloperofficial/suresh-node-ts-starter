import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { MODULE_PERMISSIONS, ROLE_PERMISSIONS } from '../src/utils/modulePermissions';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create permissions from module configuration
  console.log('📝 Creating permissions from modules...');
  const allPermissions: Array<{ id: string; name: string; resource: string; action: string }> = [];

  for (const [moduleName, moduleConfig] of Object.entries(MODULE_PERMISSIONS)) {
    for (const action of moduleConfig.actions) {
      const permissionName = `${moduleName}:${action}`;
      const description =
        moduleConfig.descriptions?.[action] || `${action} ${moduleName}`;

      const permission = await prisma.permission.upsert({
        where: { name: permissionName },
        update: {
          description,
        },
        create: {
          name: permissionName,
          description,
          resource: moduleName,
          action,
        },
      });

      allPermissions.push({
        id: permission.id,
        name: permission.name,
        resource: permission.resource,
        action: permission.action,
      });
    }
  }

  console.log(`✅ Created ${allPermissions.length} permissions from ${Object.keys(MODULE_PERMISSIONS).length} modules`);

  // Create roles
  console.log('👥 Creating roles...');
  
  // Super Admin - bypasses all permission checks
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: 'Super Administrator with unrestricted access to all APIs',
    },
  });

  // Admin - has all permissions (permission-based)
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with permission-based access to all modules',
    },
  });

  // User - limited permissions
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with permission-based limited access',
    },
  });

  // Employee - read and limited update permissions
  const employeeRole = await prisma.role.upsert({
    where: { name: 'employee' },
    update: {},
    create: {
      name: 'employee',
      description: 'Employee with permission-based read and update access',
    },
  });

  // Moderator (kept for backward compatibility)
  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator with read and update access',
    },
  });

  console.log('✅ Created roles: super_admin, admin, user, employee, moderator');

  // Assign permissions to roles from configuration
  console.log('🔗 Assigning permissions to roles...');

  const roleMap: Record<string, any> = {
    super_admin: superAdminRole, // No permissions assigned - bypasses all checks
    admin: adminRole,
    user: userRole,
    employee: employeeRole,
    moderator: moderatorRole,
  };

  for (const [roleName, rolePermissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roleMap[roleName];
    if (!role) continue;

    for (const perm of rolePermissions) {
      const permission = allPermissions.find(
        (p) => p.resource === perm.resource && p.action === perm.action
      );

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log(`  ✅ Assigned ${rolePermissions.length} permissions to ${roleName} role`);
  }

  console.log('✅ All permissions assigned to roles');

  // Create sample users with hashed passwords
  console.log('👤 Creating users...');
  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password123', 10);
  const hashedPassword3 = await bcrypt.hash('admin123', 10);
  const hashedPassword4 = await bcrypt.hash('superadmin123', 10);
  const hashedPassword5 = await bcrypt.hash('employee123', 10);

  // Super Admin User - bypasses all permission checks
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      age: 40,
      password: hashedPassword4,
      roleId: superAdminRole.id,
    },
  });

  // Admin User - has all permissions
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      age: 35,
      password: hashedPassword3,
      roleId: adminRole.id,
    },
  });

  // Regular User - limited permissions
  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      password: hashedPassword1,
      roleId: userRole.id,
    },
  });

  // Employee User - read and update permissions
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@example.com' },
    update: {},
    create: {
      name: 'Employee User',
      email: 'employee@example.com',
      age: 28,
      password: hashedPassword5,
      roleId: employeeRole.id,
    },
  });

  // Moderator User (backward compatibility)
  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      password: hashedPassword2,
      roleId: moderatorRole.id,
    },
  });

  console.log('✅ Created users:', {
    super_admin: superAdminUser.email,
    admin: adminUser.email,
    user: user1.email,
    employee: employeeUser.email,
    moderator: user2.email,
  });
  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

