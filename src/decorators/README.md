# Decorator-Based Architecture

This project uses a decorator-based architecture similar to NestJS, providing a clean and organized way to define routes, controllers, and middleware.

## Features

- **Class-based Controllers** - Organize routes using classes
- **Method Decorators** - Define HTTP methods with `@Get()`, `@Post()`, `@Put()`, `@Delete()`, etc.
- **Parameter Decorators** - Extract request data with `@Body()`, `@Query()`, `@Param()`, `@Req()`, `@Res()`
- **Validation Decorators** - Apply Joi validation with `@Validate()`
- **Middleware Decorators** - Apply middleware with `@Use()`

## Usage Examples

### Basic Controller

```typescript
import { Controller, Get } from '../decorators';

@Controller('/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] };
  }
}
```

### Controller with Parameters

```typescript
import { Controller, Get, Post, Body, Param, Query } from '../decorators';

@Controller('/users')
export class UserController {
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return { id };
  }

  @Post('/')
  createUser(@Body() body: any) {
    return { created: body };
  }

  @Get('/')
  getUsers(@Query() query: any) {
    return { query };
  }
}
```

### Controller with Validation

```typescript
import { Controller, Post, Body } from '../decorators';
import { Validate } from '../decorators/validate';
import { createUserSchema } from '../validations';

@Controller('/users')
export class UserController {
  @Post('/', Validate(createUserSchema))
  createUser(@Body() body: any) {
    return { created: body };
  }
}
```

### Controller with Middleware

```typescript
import { Controller, Get, Use } from '../decorators';
import { authenticate } from '../middlewares/auth';

@Controller('/users')
@Use(authenticate) // Class-level middleware
export class UserController {
  @Get('/')
  @Use(someMiddleware) // Method-level middleware
  getAllUsers() {
    return { users: [] };
  }
}
```

## Available Decorators

### Route Decorators

- `@Controller(path?: string)` - Marks a class as a controller
- `@Get(path?: string)` - HTTP GET method
- `@Post(path?: string)` - HTTP POST method
- `@Put(path?: string)` - HTTP PUT method
- `@Delete(path?: string)` - HTTP DELETE method
- `@Patch(path?: string)` - HTTP PATCH method

### Parameter Decorators

- `@Body(name?: string)` - Extract request body (or specific property)
- `@Query(name?: string)` - Extract query parameters (or specific property)
- `@Param(name?: string)` - Extract route parameters (or specific property)
- `@Req()` - Inject Express Request object
- `@Res()` - Inject Express Response object

### Validation Decorator

- `@Validate(schema: ValidationSchema)` - Apply Joi validation schema

### Middleware Decorator

- `@Use(...middlewares)` - Apply middleware (class-level or method-level)

## Registering Controllers

Controllers are registered in `src/app.ts`:

```typescript
import { RouterRegistry } from './core/router';
import { UserController } from './controllers/userController.decorator';

const routerRegistry = new RouterRegistry(app);
routerRegistry.registerController(UserController);
```

## Benefits

1. **Clean Code** - Declarative route definitions
2. **Type Safety** - Full TypeScript support
3. **Organization** - Group related routes in classes
4. **Reusability** - Easy to apply middleware and validation
5. **Maintainability** - Clear separation of concerns

