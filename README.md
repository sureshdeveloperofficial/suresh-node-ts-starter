# Node.js TypeScript Server Starter

A modern, production-ready Node.js server setup with **decorator-based architecture**, TypeScript, Express, Prisma, and PostgreSQL.

## ✨ Features

- 🎯 **Decorator-Based Architecture** - Clean, declarative route definitions
- ⚡ **TypeScript** - Full type safety with latest TypeScript features
- 🚀 **Express** - Fast, unopinionated web framework
- 🗄️ **Prisma + PostgreSQL** - Modern ORM with PostgreSQL database
- 🔐 **Authentication** - JWT-based auth with Redis token management
- 🔒 **Security** - Helmet.js for security headers
- 📝 **Validation** - Joi validation with decorators
- 📝 **Logging** - Morgan for HTTP request logging
- 🌐 **CORS** - Cross-Origin Resource Sharing enabled
- 🔄 **Hot Reload** - Nodemon for development
- 📦 **Modern Tooling** - Latest Node.js and TypeScript versions

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn or pnpm

## Installation

### Option 1: Scaffold a new project (recommended)

Use the CLI to create a fresh project in a new folder:

```bash
npx suresh-node-ts-starter my-new-app
cd my-new-app
npm install
```

Then follow the `.env` and database setup steps shown below.

### Option 2: Clone this repository

1. Clone the repository:
```bash
git clone <your-repo-url>
cd suresh-node-ts-starter
```

2. Install dependencies:
```bash
npm install
```

3. Set up PostgreSQL database:

   **Option A: Using Docker (Recommended for development)**
   
   If you have Docker installed, use one of these commands:
   ```bash
   # Modern Docker (docker compose as subcommand)
   docker compose up -d
   
   # OR if you have docker-compose installed separately
   docker-compose up -d
   ```
   
   If Docker Compose is not installed, you can install it:
   ```bash
   # For Ubuntu/Debian/Kali
   sudo apt install docker-compose
   
   # Or use Docker's built-in compose (recommended)
   # Just use: docker compose (no hyphen needed)
   ```

   **Option B: Using existing PostgreSQL**
   - Make sure PostgreSQL is installed and running on your machine
   - Create a database: `createdb suresh_db` (or use `psql` to create it)

4. Create a `.env` file:
```bash
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/suresh_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
```

5. Set up the database:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed
```

## Usage

### Development

Run the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

### Production

1. Build the TypeScript code:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

### Other Scripts

- `npm run type-check` - Type check without building
- `npm run clean` - Remove the dist folder

## Project Structure

This project uses a **decorator-based architecture** for clean, scalable code. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

```
src/
├── config/              # Configuration (env, database)
├── controllers/         # Decorator-based controllers
├── core/               # Core framework (router, registry)
├── decorators/         # Custom decorators (@Controller, @Get, etc.)
├── middlewares/        # Express middlewares
├── services/           # Business logic layer
├── validations/        # Joi validation schemas
├── utils/              # Utility functions
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## API Endpoints

### Public Endpoints
- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /api` - API information

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (requires auth)
- `POST /api/auth/me` - Get current user (requires auth)

### Protected User Endpoints (Require Authentication)
- `GET /api/users` - Get all users (with pagination, search, sorting)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

> See [AUTH_MODULE.md](./AUTH_MODULE.md) for detailed authentication documentation.

## Development

### Decorator-Based Architecture

This project uses **decorator-based architecture** for clean, maintainable code. See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

### Adding New Controllers

1. Create a controller file: `src/controllers/product.controller.ts`
```typescript
import { Controller, Get, Post, Body } from '../decorators';
import { Validate } from '../decorators/validate';

@Controller('/products')
export class ProductController {
  @Get('/')
  async getProducts() {
    return { products: [] };
  }

  @Post('/', Validate(createProductSchema))
  async createProduct(@Body() body: any) {
    return { created: body };
  }
}
```

2. Export from `src/controllers/index.ts`
3. Register in `src/core/controllers.registry.ts`

### Using Services

Services contain business logic:
```typescript
import { UserService } from '../services';

const users = await UserService.getUsers({ page: 1, limit: 10 });
```

### Validation

Apply validation using decorators:
```typescript
@Post('/', Validate(createUserSchema))
async createUser(@Body() body: any) {
  // body is already validated
}
```

### TypeScript Configuration

The project uses strict TypeScript settings. Modify `tsconfig.json` to adjust compiler options.

## License

MIT