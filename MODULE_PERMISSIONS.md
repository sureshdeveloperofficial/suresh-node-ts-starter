# Module-Based Permissions System

This document explains the scalable, module-based role and permissions system.

## Overview

The system is designed to be:
- **Module-based**: Permissions are organized by modules (user, product, order, etc.)
- **Scalable**: Easy to add new modules and permissions
- **Flexible**: Support for complex permission requirements
- **Type-safe**: Full TypeScript support

## Architecture

### 1. Module Configuration (`src/utils/modulePermissions.ts`)

Define all modules and their permissions in one place:

```typescript
export const MODULE_PERMISSIONS: Record<string, ModuleConfig> = {
  user: {
    name: 'user',
    actions: ['create', 'read', 'update', 'delete'],
    descriptions: {
      create: 'Create new users',
      read: 'View user information',
      update: 'Update user information',
      delete: 'Delete users',
    },
  },
  // Add more modules here...
};
```

### 2. Role Permission Mappings

Define which permissions each role has:

```typescript
export const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  admin: [
    // All permissions for all modules
    ...Object.values(MODULE_PERMISSIONS).flatMap((module) =>
      module.actions.map((action) => ({
        resource: module.name,
        action,
      }))
    ),
  ],
  user: [
    { resource: 'user', action: 'read' },
    { resource: 'product', action: 'read' },
    // ...
  ],
};
```

## Adding a New Module

### Step 1: Define Module Permissions

Add your module to `src/utils/modulePermissions.ts`:

```typescript
export const MODULE_PERMISSIONS: Record<string, ModuleConfig> = {
  // ... existing modules
  inventory: {
    name: 'inventory',
    actions: ['create', 'read', 'update', 'delete', 'adjust'],
    descriptions: {
      create: 'Add inventory items',
      read: 'View inventory',
      update: 'Update inventory',
      delete: 'Remove inventory items',
      adjust: 'Adjust inventory quantities',
    },
  },
};
```

### Step 2: Assign Permissions to Roles

Update `ROLE_PERMISSIONS` in the same file:

```typescript
export const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  // ... existing roles
  warehouse: [
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'update' },
    { resource: 'inventory', action: 'adjust' },
  ],
};
```

### Step 3: Run Seed Script

```bash
npm run prisma:seed
```

This will:
- Create all permissions for the new module
- Assign permissions to roles as configured

### Step 4: Use in Controllers

```typescript
import { Permission, Permissions } from '../decorators/permission';

@Controller('/inventory')
@Auth()
export class InventoryController {
  @Get('/')
  @Permission({ resource: 'inventory', action: 'read' })
  async getInventory() {
    // ...
  }

  @Post('/')
  @Permission({ resource: 'inventory', action: 'create' })
  async createItem() {
    // ...
  }

  // Or use helper
  @Put('/:id')
  @Permissions.inventory.update()
  async updateItem() {
    // ...
  }
}
```

## Permission Service

### Check Permissions Programmatically

```typescript
import { PermissionService } from '../services/permission.service';

// Check single permission
const canDelete = await PermissionService.hasPermission(
  userId,
  'user',
  'delete'
);

// Check multiple permissions (any)
const canManage = await PermissionService.hasAnyPermission(userId, [
  { resource: 'user', action: 'create' },
  { resource: 'user', action: 'update' },
]);

// Check multiple permissions (all)
const canFullManage = await PermissionService.hasAllPermissions(userId, [
  { resource: 'user', action: 'create' },
  { resource: 'user', action: 'read' },
  { resource: 'user', action: 'update' },
  { resource: 'user', action: 'delete' },
]);

// Get all user permissions
const permissions = await PermissionService.getUserPermissions(userId);
// Returns: ['user:create', 'user:read', 'product:read', ...]
```

## Decorators

### @Permission Decorator

```typescript
// Single permission
@Permission({ resource: 'user', action: 'delete' })

// Multiple permissions (any)
@Permission(
  [
    { resource: 'user', action: 'create' },
    { resource: 'user', action: 'update' },
  ],
  { requireAll: false }
)

// Multiple permissions (all)
@Permission(
  [
    { resource: 'user', action: 'read' },
    { resource: 'user', action: 'update' },
  ],
  { requireAll: true }
)
```

### Helper Decorators

```typescript
import { Permissions } from '../decorators/permission';

// User module
@Permissions.user.create()
@Permissions.user.read()
@Permissions.user.update()
@Permissions.user.delete()
@Permissions.user.manage() // Any of create/read/update/delete

// Product module
@Permissions.product.create()
@Permissions.product.read()
// ...
```

## Current Modules

- **user**: create, read, update, delete
- **product**: create, read, update, delete
- **order**: create, read, update, cancel, fulfill
- **payment**: create, read, refund, verify
- **report**: read, export
- **settings**: read, update

## Best Practices

1. **Consistent Naming**: Use lowercase, singular nouns for module names (user, product, not users, products)

2. **Standard Actions**: Use common actions:
   - `create` - Create new resources
   - `read` - View resources
   - `update` - Modify resources
   - `delete` - Remove resources
   - Custom actions as needed (e.g., `cancel`, `fulfill`, `export`)

3. **Role Design**: Design roles based on job functions:
   - `admin` - Full access
   - `moderator` - Read and update access
   - `user` - Limited read access
   - Custom roles for specific needs

4. **Permission Granularity**: 
   - Too granular: Hard to manage
   - Too broad: Security risks
   - Balance: Group related actions, separate critical actions

5. **Documentation**: Always add descriptions for permissions to make them self-documenting

## Migration Guide

### From Role-Based to Permission-Based

If you're currently using `@Roles('admin')`, you can migrate:

```typescript
// Old
@Roles('admin')

// New
@Permission({ resource: 'user', action: 'delete' })
```

This provides:
- More granular control
- Better scalability
- Easier to audit
- Module-based organization

## API Examples

### Get User Permissions

```typescript
GET /api/auth/permissions
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "permissions": [
      "user:read",
      "user:update",
      "product:read"
    ]
  }
}
```

### Check Permission

```typescript
// In your service
const canDelete = await PermissionService.hasPermission(
  req.user.userId,
  'user',
  'delete'
);
```

## Future Enhancements

- Permission inheritance
- Dynamic permission assignment
- Permission groups
- Time-based permissions
- IP-based restrictions
- Audit logging for permission checks

