# Project Structure

This project uses a **decorator-based architecture** for clean, scalable, and maintainable code.

## 📁 Directory Structure

```
src/
├── config/              # Configuration files
│   ├── database.ts      # Prisma database client
│   ├── env.ts           # Environment variables
│   └── index.ts         # Config exports
│
├── controllers/          # Controllers (decorator-based)
│   ├── user.controller.ts
│   ├── home.controller.ts
│   ├── health.controller.ts
│   ├── api.controller.ts
│   └── index.ts         # Controller exports
│
├── core/                 # Core framework files
│   ├── router.ts        # Router registry system
│   └── controllers.registry.ts  # Controller registration
│
├── decorators/           # Custom decorators
│   ├── controller.ts     # @Controller decorator
│   ├── routes.ts         # @Get, @Post, @Put, @Delete decorators
│   ├── params.ts         # @Body, @Query, @Param, @Req, @Res
│   ├── middleware.ts    # @Use decorator
│   ├── validate.ts      # @Validate decorator
│   └── index.ts         # Decorator exports
│
├── middlewares/          # Express middlewares
│   ├── errorHandler.ts  # Global error handler
│   ├── notFound.ts      # 404 handler
│   ├── validator.ts     # Joi validation middleware
│   └── index.ts         # Middleware exports
│
├── services/             # Business logic layer
│   ├── userService.ts   # User business logic
│   └── index.ts         # Service exports
│
├── validations/          # Joi validation schemas
│   ├── userValidation.ts
│   └── index.ts
│
├── utils/                # Utility functions
│   ├── logger.ts        # Logger utility
│   ├── response.ts      # Response helpers
│   └── index.ts
│
├── app.ts               # Express app setup
└── server.ts            # Server entry point
```

## 🎯 Key Concepts

### 1. Controllers (Decorator-Based)

All controllers use decorators for clean, declarative route definitions:

```typescript
@Controller('/users')
export class UserController {
  @Get('/')
  async getUsers(@Query() query: any) {
    // Handler logic
  }

  @Post('/', Validate(createUserSchema))
  async createUser(@Body() body: any) {
    // Handler logic
  }
}
```

### 2. Services (Business Logic)

Services contain all business logic and database operations:

```typescript
export class UserService {
  static async getUsers(query: UserListQuery) {
    // Business logic here
  }
}
```

### 3. Validations (Joi Schemas)

Validation schemas are defined separately and applied via decorators:

```typescript
export const createUserSchema = {
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
  }),
};
```

## 🚀 Adding New Features

### Adding a New Controller

1. Create controller file: `src/controllers/product.controller.ts`
2. Use decorators to define routes
3. Export from `src/controllers/index.ts`
4. Register in `src/core/controllers.registry.ts`

```typescript
@Controller('/products')
export class ProductController {
  @Get('/')
  async getProducts() {
    // Implementation
  }
}
```

### Adding a New Service

1. Create service file: `src/services/productService.ts`
2. Implement business logic
3. Export from `src/services/index.ts`

### Adding Validation

1. Create schema in `src/validations/productValidation.ts`
2. Use `@Validate()` decorator in controller

## 📝 Naming Conventions

- **Controllers**: `*.controller.ts` (e.g., `user.controller.ts`)
- **Services**: `*Service.ts` (e.g., `userService.ts`)
- **Validations**: `*Validation.ts` (e.g., `userValidation.ts`)
- **Classes**: PascalCase (e.g., `UserController`)
- **Files**: kebab-case (e.g., `user.controller.ts`)

## 🔧 Decorators Reference

### Route Decorators
- `@Controller(path)` - Mark class as controller
- `@Get(path)` - HTTP GET route
- `@Post(path)` - HTTP POST route
- `@Put(path)` - HTTP PUT route
- `@Delete(path)` - HTTP DELETE route

### Parameter Decorators
- `@Body()` - Request body
- `@Query()` - Query parameters
- `@Param(name)` - Route parameters
- `@Req()` - Express Request object
- `@Res()` - Express Response object

### Other Decorators
- `@Validate(schema)` - Apply Joi validation
- `@Use(...middlewares)` - Apply middleware

## 🎨 Best Practices

1. **Keep controllers thin** - Move business logic to services
2. **Use TypeScript types** - Define interfaces for all data structures
3. **Validate inputs** - Always use `@Validate()` for user input
4. **Handle errors** - Use try-catch and proper error responses
5. **Follow naming conventions** - Keep code consistent

## 📚 Example: Complete Feature

```typescript
// 1. Controller
@Controller('/products')
export class ProductController {
  @Get('/:id', Validate(getProductSchema))
  async getProduct(@Param('id') id: string) {
    return await ProductService.getById(id);
  }
}

// 2. Service
export class ProductService {
  static async getById(id: string) {
    return await prisma.product.findUnique({ where: { id } });
  }
}

// 3. Validation
export const getProductSchema = {
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
```

