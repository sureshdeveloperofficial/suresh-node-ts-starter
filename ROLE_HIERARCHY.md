# Role Hierarchy & Permission System

This document explains the hierarchical role-based permission system.

## Role Hierarchy

The system supports multiple roles with different access levels:

### 1. **Super Admin** (`super_admin`)
- **Access**: Bypasses ALL permission checks
- **Use Case**: System administrators who need unrestricted access
- **Behavior**: Can access any API endpoint regardless of permissions
- **Note**: No permissions need to be assigned - bypasses all checks

### 2. **Admin** (`admin`)
- **Access**: Permission-based access to ALL modules
- **Use Case**: Administrators who manage the system
- **Behavior**: Has all permissions for all modules (user, product, order, payment, report, settings)
- **Permissions**: All CRUD operations for all modules

### 3. **User** (`user`)
- **Access**: Permission-based limited access
- **Use Case**: Regular end users
- **Behavior**: Can read and create basic resources
- **Permissions**:
  - `user:read` - View user information
  - `product:read` - View products
  - `order:create` - Create orders
  - `order:read` - View orders
  - `payment:create` - Process payments
  - `payment:read` - View payments

### 4. **Employee** (`employee`)
- **Access**: Permission-based read and update access
- **Use Case**: Staff members who manage day-to-day operations
- **Behavior**: Can read and update resources but not delete
- **Permissions**:
  - `user:read` - View users
  - `product:read` - View products
  - `product:update` - Update products
  - `order:read` - View orders
  - `order:update` - Update orders
  - `payment:read` - View payments
  - `report:read` - View reports

### 5. **Moderator** (`moderator`)
- **Access**: Permission-based read and update access (backward compatibility)
- **Use Case**: Content moderators
- **Permissions**: Similar to employee with additional fulfill permissions

## How It Works

### Super Admin Bypass

Super Admin users bypass all permission checks:

```typescript
// In Permission decorator
if (userRole === 'super_admin') {
  next(); // Allow access immediately
  return;
}
```

### Permission-Based Access

Other roles check permissions:

```typescript
// Admin, User, Employee check permissions
const hasPermission = await PermissionService.hasPermission(
  userId,
  'user',
  'delete'
);
```

## Usage Examples

### Controller with Permission Checks

```typescript
@Controller('/users')
@Auth() // Requires authentication
export class UserController {
  // Super Admin: ✅ Access
  // Admin: ✅ Access (has user:read permission)
  // User: ✅ Access (has user:read permission)
  // Employee: ✅ Access (has user:read permission)
  @Get('/')
  @Permission({ resource: 'user', action: 'read' })
  async getUsers() {
    // ...
  }

  // Super Admin: ✅ Access
  // Admin: ✅ Access (has user:delete permission)
  // User: ❌ Access Denied (no user:delete permission)
  // Employee: ❌ Access Denied (no user:delete permission)
  @Delete('/:id')
  @Permission({ resource: 'user', action: 'delete' })
  async deleteUser() {
    // ...
  }
}
```

## Test Users

After running seed script:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | `superadmin@example.com` | `superadmin123` | All APIs (bypass) |
| Admin | `admin@example.com` | `admin123` | All modules (permission-based) |
| User | `john@example.com` | `password123` | Limited (permission-based) |
| Employee | `employee@example.com` | `employee123` | Read/Update (permission-based) |
| Moderator | `jane@example.com` | `password123` | Read/Update (permission-based) |

## Permission Flow

```
Request → @Auth() → Check Token → @Permission() → Check Role
                                              ↓
                                    ┌─────────┴─────────┐
                                    │                   │
                              super_admin?         Other Roles?
                                    │                   │
                                    ✅              Check Permissions
                              (Bypass All)              │
                                                    Has Permission?
                                                          │
                                                    ┌─────┴─────┐
                                                    │           │
                                                   ✅          ❌
                                            (Allow)      (Deny 403)
```

## Adding New Roles

1. **Add role to seed script** (`prisma/seed.ts`):
```typescript
const newRole = await prisma.role.upsert({
  where: { name: 'new_role' },
  update: {},
  create: {
    name: 'new_role',
    description: 'Description of new role',
  },
});
```

2. **Define permissions** (`src/utils/modulePermissions.ts`):
```typescript
export const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  // ... existing roles
  new_role: [
    { resource: 'user', action: 'read' },
    { resource: 'product', action: 'read' },
    // ... more permissions
  ],
};
```

3. **Run seed**:
```bash
npm run prisma:seed
```

## Best Practices

1. **Use Super Admin Sparingly**: Only for system-level operations
2. **Permission-Based for Others**: All other roles should use permission-based access
3. **Granular Permissions**: Define specific permissions for each action
4. **Test All Roles**: Verify access for each role level
5. **Document Permissions**: Keep `MODULE_PERMISSIONS.md` updated

## Security Considerations

- Super Admin bypasses all checks - use with extreme caution
- Permission checks happen at the decorator level
- All permission checks are logged for audit
- Token-based authentication required before permission checks
- Role information is stored in JWT for fast access

