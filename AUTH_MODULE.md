# Authentication Module

This project includes a complete authentication system with JWT tokens and Redis for token management.

## Features

- ✅ **JWT Authentication** - Access and refresh tokens
- ✅ **Redis Integration** - Token storage and blacklisting
- ✅ **Password Hashing** - Bcrypt for secure password storage
- ✅ **Role-Based Access Control** - User roles (user, admin)
- ✅ **Decorator-Based** - Clean `@Auth()` and `@Roles()` decorators
- ✅ **Token Refresh** - Secure token refresh mechanism
- ✅ **Token Blacklisting** - Logout with token revocation

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=your-redis-password (if needed)

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10
```

### 2. Start Redis

Using Docker:
```bash
docker compose up -d redis
```

Or install Redis locally and start the service.

### 3. Database Migration

Update the database schema:
```bash
npm run prisma:migrate
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires auth)
- `POST /api/auth/me` - Get current user (requires auth)

### Example Requests

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "age": 30
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```bash
POST /api/auth/me
Authorization: Bearer <accessToken>
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

## Using Authentication Decorators

### Protect Routes

Use `@Auth()` decorator to require authentication:

```typescript
@Controller('/products')
@Auth() // All routes require authentication
export class ProductController {
  @Get('/')
  async getProducts() {
    // Only authenticated users can access
  }
}
```

### Method-Level Authentication

```typescript
@Controller('/products')
export class ProductController {
  @Get('/')
  async getProducts() {
    // Public route
  }

  @Post('/')
  @Auth() // Only this route requires auth
  async createProduct() {
    // Protected route
  }
}
```

### Role-Based Access Control

Use `@Roles()` decorator for role-based access:

```typescript
@Controller('/admin')
@Auth() // Require authentication
@Roles('admin') // Only admins can access
export class AdminController {
  @Get('/users')
  async getAllUsers() {
    // Only admins can access
  }
}
```

### Multiple Roles

```typescript
@Get('/dashboard')
@Auth()
@Roles('admin', 'moderator') // Admin OR moderator
async getDashboard() {
  // Accessible by admin or moderator
}
```

## Token Management

### Access Token
- Short-lived (default: 15 minutes)
- Used for API requests
- Stored in Authorization header: `Bearer <token>`
- Blacklisted on logout

### Refresh Token
- Long-lived (default: 7 days)
- Stored in Redis
- Used to get new access tokens
- Revoked on logout

## Security Features

1. **Password Hashing** - Bcrypt with configurable salt rounds
2. **Token Blacklisting** - Revoked tokens stored in Redis
3. **Token Expiry** - Short-lived access tokens
4. **Role-Based Access** - Fine-grained permissions
5. **Account Status** - Active/inactive user accounts

## Redis Usage

Redis is used for:
- **Refresh Token Storage** - `refresh_token:{userId}`
- **Token Blacklisting** - `blacklist:{token}`
- **Session Management** - Can be extended for sessions

## Example: Protected User Routes

```typescript
@Controller('/users')
@Auth() // All routes require authentication
export class UserController {
  @Get('/')
  async getUsers() {
    // Authenticated users only
  }

  @Delete('/:id')
  @Roles('admin') // Only admins can delete
  async deleteUser(@Param('id') id: string) {
    // Admin only
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "No token provided"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "message": "Insufficient permissions"
  }
}
```

## Best Practices

1. **Always use HTTPS** in production
2. **Change JWT_SECRET** to a strong random string
3. **Set appropriate token expiry** times
4. **Use refresh tokens** for better security
5. **Implement rate limiting** for auth endpoints
6. **Log authentication events** for security monitoring

