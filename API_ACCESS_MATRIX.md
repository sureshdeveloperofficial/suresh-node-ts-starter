# API Access Matrix

This document shows which roles can access which API endpoints.

## Role Access Summary

| Role | Access Type | Description |
|------|-------------|-------------|
| **Super Admin** | Bypass All | Can access ALL APIs without permission checks |
| **Admin** | Permission-Based | Has all permissions for all modules |
| **User** | Permission-Based | Limited read and create permissions |
| **Employee** | Permission-Based | Read and update permissions |
| **Moderator** | Permission-Based | Read and update permissions (backward compatibility) |

## User Endpoints

| Endpoint | Method | Super Admin | Admin | User | Employee | Moderator |
|----------|--------|-------------|-------|------|----------|-----------|
| `/api/users` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/users/:id` | GET | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/api/users` | POST | ✅ | ✅ | ❌ | ❌ | ❌ |
| `/api/users/:id` | PUT | ✅ | ✅ | ❌ | ❌ | ✅ |
| `/api/users/:id` | DELETE | ✅ | ✅ | ❌ | ❌ | ❌ |

**Permissions Required:**
- `GET /api/users` → `user:read`
- `GET /api/users/:id` → `user:read`
- `POST /api/users` → `user:create`
- `PUT /api/users/:id` → `user:update`
- `DELETE /api/users/:id` → `user:delete`

## Authentication Endpoints

| Endpoint | Method | Access |
|----------|--------|--------|
| `/api/auth/register` | POST | Public |
| `/api/auth/login` | POST | Public |
| `/api/auth/refresh` | POST | Public |
| `/api/auth/logout` | POST | Authenticated |
| `/api/auth/me` | POST | Authenticated |

## Permission Breakdown by Role

### Super Admin
- ✅ **All APIs** - Bypasses all permission checks
- No permissions assigned (not needed)

### Admin
- ✅ `user:create`, `user:read`, `user:update`, `user:delete`
- ✅ `product:create`, `product:read`, `product:update`, `product:delete`
- ✅ `order:create`, `order:read`, `order:update`, `order:cancel`, `order:fulfill`
- ✅ `payment:create`, `payment:read`, `payment:refund`, `payment:verify`
- ✅ `report:read`, `report:export`
- ✅ `settings:read`, `settings:update`

### User
- ✅ `user:read`
- ✅ `product:read`
- ✅ `order:create`, `order:read`
- ✅ `payment:create`, `payment:read`

### Employee
- ✅ `user:read`
- ✅ `product:read`, `product:update`
- ✅ `order:read`, `order:update`
- ✅ `payment:read`
- ✅ `report:read`

### Moderator
- ✅ `user:read`, `user:update`
- ✅ `product:read`, `product:update`
- ✅ `order:read`, `order:update`, `order:fulfill`
- ✅ `payment:read`
- ✅ `report:read`
- ✅ `settings:read`

## Testing Access

### Test as Super Admin
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"superadmin123"}'

# Access any endpoint (will work)
curl -X DELETE http://localhost:3000/api/users/:id \
  -H "Authorization: Bearer <token>"
```

### Test as Admin
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Access endpoint (will work - has user:delete permission)
curl -X DELETE http://localhost:3000/api/users/:id \
  -H "Authorization: Bearer <token>"
```

### Test as User
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Access endpoint (will fail - no user:delete permission)
curl -X DELETE http://localhost:3000/api/users/:id \
  -H "Authorization: Bearer <token>"
# Response: 403 - Insufficient permissions
```

## Adding New Endpoints

When adding new endpoints, use the `@Permission` decorator:

```typescript
@Controller('/products')
@Auth()
export class ProductController {
  // Super Admin: ✅ | Admin: ✅ | User: ✅ | Employee: ✅
  @Get('/')
  @Permission({ resource: 'product', action: 'read' })
  async getProducts() {
    // ...
  }

  // Super Admin: ✅ | Admin: ✅ | User: ❌ | Employee: ❌
  @Post('/')
  @Permission({ resource: 'product', action: 'create' })
  async createProduct() {
    // ...
  }

  // Super Admin: ✅ | Admin: ✅ | User: ❌ | Employee: ✅
  @Put('/:id')
  @Permission({ resource: 'product', action: 'update' })
  async updateProduct() {
    // ...
  }
}
```

## Permission Check Flow

```
1. Request arrives
   ↓
2. @Auth() decorator verifies JWT token
   ↓
3. @Permission() decorator checks:
   ├─ Is user super_admin? → ✅ Allow (bypass)
   └─ Is user other role? → Check permissions
       ├─ Has required permission? → ✅ Allow
       └─ No permission? → ❌ Deny (403)
```

## Security Notes

1. **Super Admin is Powerful**: Use only for system administrators
2. **Permission-Based is Safer**: All other roles use explicit permissions
3. **Audit Trail**: All permission checks can be logged
4. **Token-Based**: JWT tokens contain role information for fast checks
5. **Module-Based**: Permissions are organized by modules for scalability

