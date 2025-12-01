# Permission Management Module

A comprehensive, scalable permission management system for managing roles, permissions, and access control across all modules.

## Overview

The Permission Module provides a complete API for managing permissions in a module-based architecture. It allows you to:

- Create and manage permissions for any module
- Assign permissions to roles dynamically
- View permissions by module or role
- Get user-specific permissions
- Bulk create permissions for new modules

## Features

### 🔐 Permission Management
- **Create Permissions**: Create individual permissions for any module
- **Bulk Create**: Create all permissions for a module at once
- **Update Permissions**: Update permission descriptions
- **Delete Permissions**: Remove permissions (with safety checks)
- **List Permissions**: View all permissions organized by module

### 👥 Role Management
- **Assign Permissions**: Assign multiple permissions to a role
- **View Role Permissions**: Get all permissions assigned to a specific role
- **Role Hierarchy**: Supports hierarchical roles (super_admin, admin, user, employee)

### 📊 Module Management
- **List Modules**: Get all available modules
- **Module Permissions**: Get all permissions for a specific module
- **Scalable**: Easy to add new modules without code changes

### 👤 User Permissions
- **User Permissions**: Get all permissions for the authenticated user
- **Role-based**: Automatically includes permissions from user's role

## API Endpoints

### Authentication
All endpoints require authentication (`@Auth()` decorator). Most endpoints also require specific permissions.

### Base Path
```
/api/permissions
```

### Endpoints

#### 1. Get All Permissions
```http
GET /api/permissions
```
**Permission Required**: `permission:read`

**Response**:
```json
{
  "success": true,
  "data": {
    "modules": ["user", "product", "order", ...],
    "permissions": {
      "user": [
        { "id": "...", "name": "user:create", "resource": "user", "action": "create", ... }
      ],
      "product": [...]
    },
    "totalModules": 7
  }
}
```

#### 2. Get Permissions by Module
```http
GET /api/permissions/module/:module
```
**Permission Required**: `permission:read`

**Example**: `GET /api/permissions/module/user`

**Response**:
```json
{
  "success": true,
  "data": {
    "module": "user",
    "permissions": [
      {
        "id": "...",
        "name": "user:create",
        "resource": "user",
        "action": "create",
        "description": "Create new users"
      },
      ...
    ],
    "count": 4
  }
}
```

#### 3. Get All Modules
```http
GET /api/permissions/modules
```
**Permission Required**: `permission:read`

**Response**:
```json
{
  "success": true,
  "data": {
    "modules": ["user", "product", "order", "payment", "report", "settings", "permission"],
    "count": 7
  }
}
```

#### 4. Get User Permissions
```http
GET /api/permissions/user
```
**No Permission Required** (any authenticated user can view their own permissions)

**Response**:
```json
{
  "success": true,
  "data": {
    "permissions": [
      { "resource": "user", "action": "read" },
      { "resource": "product", "action": "read" },
      ...
    ],
    "count": 6
  }
}
```

#### 5. Get Role Permissions
```http
GET /api/permissions/role/:roleName
```
**Permission Required**: `permission:read`

**Example**: `GET /api/permissions/role/admin`

**Response**:
```json
{
  "success": true,
  "data": {
    "role": {
      "id": "...",
      "name": "admin",
      "description": "Administrator role"
    },
    "permissions": [
      {
        "id": "...",
        "name": "user:create",
        "resource": "user",
        "action": "create",
        "description": "Create new users"
      },
      ...
    ],
    "count": 26
  }
}
```

#### 6. Create Permission
```http
POST /api/permissions
```
**Permission Required**: `permission:create`

**Request Body**:
```json
{
  "name": "product:export",
  "resource": "product",
  "action": "export",
  "description": "Export product data"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "permission": {
      "id": "...",
      "name": "product:export",
      "resource": "product",
      "action": "export",
      "description": "Export product data"
    }
  }
}
```

#### 7. Create Module Permissions (Bulk)
```http
POST /api/permissions/module/:module
```
**Permission Required**: `permission:create`

**Example**: `POST /api/permissions/module/inventory`

**Request Body**:
```json
{
  "actions": ["create", "read", "update", "delete", "transfer"],
  "descriptions": {
    "create": "Create inventory items",
    "read": "View inventory",
    "update": "Update inventory",
    "delete": "Delete inventory",
    "transfer": "Transfer inventory between locations"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "module": "inventory",
    "permissions": [
      { "id": "...", "name": "inventory:create", ... },
      ...
    ],
    "count": 5
  }
}
```

#### 8. Assign Permissions to Role
```http
POST /api/permissions/assign
```
**Permission Required**: `permission:assign`

**Request Body**:
```json
{
  "roleName": "employee",
  "permissions": [
    { "resource": "product", "action": "read" },
    { "resource": "product", "action": "update" },
    { "resource": "order", "action": "read" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "role": "employee",
    "assignedPermissions": [
      { "resource": "product", "action": "read" },
      ...
    ],
    "totalPermissions": 7
  }
}
```

#### 9. Update Permission
```http
PUT /api/permissions/:id
```
**Permission Required**: `permission:update`

**Request Body**:
```json
{
  "description": "Updated description"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "permission": {
      "id": "...",
      "name": "user:create",
      "resource": "user",
      "action": "create",
      "description": "Updated description"
    }
  }
}
```

#### 10. Delete Permission
```http
DELETE /api/permissions/:id
```
**Permission Required**: `permission:delete`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "..."
  }
}
```

## Adding a New Module

### Step 1: Define Module in `modulePermissions.ts`

Add your module to `MODULE_PERMISSIONS`:

```typescript
// src/utils/modulePermissions.ts
export const MODULE_PERMISSIONS: Record<string, ModuleConfig> = {
  // ... existing modules
  inventory: {
    name: 'inventory',
    actions: ['create', 'read', 'update', 'delete', 'transfer'],
    descriptions: {
      create: 'Create inventory items',
      read: 'View inventory',
      update: 'Update inventory',
      delete: 'Delete inventory',
      transfer: 'Transfer inventory between locations',
    },
  },
};
```

### Step 2: Update Role Permissions (Optional)

Add permissions to roles in `ROLE_PERMISSIONS`:

```typescript
export const ROLE_PERMISSIONS: Record<string, Array<{ resource: string; action: string }>> = {
  admin: [
    // ... existing permissions
    { resource: 'inventory', action: 'create' },
    { resource: 'inventory', action: 'read' },
    // ... etc
  ],
  employee: [
    { resource: 'inventory', action: 'read' },
    { resource: 'inventory', action: 'update' },
  ],
};
```

### Step 3: Run Seed Script

```bash
npm run prisma:seed
```

This will:
- Create all permissions for the new module
- Assign permissions to roles based on `ROLE_PERMISSIONS`

### Step 4: Use in Controllers

Apply permissions to your controller routes:

```typescript
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
  async createInventory() {
    // ...
  }
}
```

## Permission Structure

### Permission Naming Convention
- Format: `{resource}:{action}`
- Examples:
  - `user:create`
  - `product:read`
  - `order:update`
  - `payment:refund`

### Common Actions
- `create`: Create new resources
- `read`: View resources
- `update`: Modify resources
- `delete`: Remove resources
- `export`: Export data
- `import`: Import data
- `approve`: Approve actions
- `reject`: Reject actions

## Access Control

### Role Hierarchy

1. **Super Admin** (`super_admin`)
   - Bypasses ALL permission checks
   - Has access to everything
   - Can manage all permissions

2. **Admin** (`admin`)
   - Has all permissions for all modules
   - Can manage permissions
   - Can assign roles

3. **User** (`user`)
   - Limited permissions (read, create)
   - Cannot manage permissions
   - Cannot assign roles

4. **Employee** (`employee`)
   - Limited permissions (read, update)
   - Cannot manage permissions
   - Cannot assign roles

5. **Moderator** (`moderator`)
   - Moderate permissions (read, update, fulfill)
   - Cannot manage permissions
   - Cannot assign roles

## Usage Examples

### Example 1: Create Permissions for New Module

```bash
# Create permissions for 'inventory' module
curl -X POST http://localhost:3000/api/permissions/module/inventory \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "actions": ["create", "read", "update", "delete", "transfer"],
    "descriptions": {
      "create": "Create inventory items",
      "read": "View inventory",
      "update": "Update inventory",
      "delete": "Delete inventory",
      "transfer": "Transfer inventory"
    }
  }'
```

### Example 2: Assign Permissions to Role

```bash
curl -X POST http://localhost:3000/api/permissions/assign \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "employee",
    "permissions": [
      { "resource": "inventory", "action": "read" },
      { "resource": "inventory", "action": "update" }
    ]
  }'
```

### Example 3: Get User Permissions

```bash
curl -X GET http://localhost:3000/api/permissions/user \
  -H "Authorization: Bearer <user_token>"
```

## Best Practices

1. **Module-Based Organization**: Keep permissions organized by module
2. **Consistent Naming**: Use consistent action names across modules
3. **Descriptive Names**: Use clear, descriptive permission names
4. **Role-Based Assignment**: Assign permissions to roles, not individual users
5. **Least Privilege**: Grant minimum required permissions
6. **Regular Audits**: Review and audit permissions regularly
7. **Documentation**: Document custom permissions and their purposes

## Security Considerations

1. **Authentication Required**: All endpoints require authentication
2. **Permission Checks**: Most endpoints require specific permissions
3. **Super Admin Bypass**: Super admin bypasses all checks (use carefully)
4. **Input Validation**: All inputs are validated using Joi
5. **Rate Limiting**: All endpoints are rate-limited
6. **Error Handling**: Errors don't expose sensitive information

## Future Enhancements

- [ ] Permission inheritance between roles
- [ ] Time-based permissions (temporary access)
- [ ] IP-based restrictions
- [ ] Permission groups/templates
- [ ] Audit log for permission changes
- [ ] Permission approval workflow
- [ ] Custom permission types

## Related Documentation

- [Module Permissions](./MODULE_PERMISSIONS.md) - Module-based permission system
- [Role Hierarchy](./ROLE_HIERARCHY.md) - Role hierarchy and access control
- [API Access Matrix](./API_ACCESS_MATRIX.md) - API access by role

