# Prisma Database Setup

This project uses Prisma as the ORM for database management.

## Database Configuration

The project is configured to use PostgreSQL by default. You can change this in `prisma/schema.prisma`.

### Supported Databases

- **PostgreSQL** (default) - `postgresql://user:password@localhost:5432/dbname?schema=public`
- **SQLite** - `file:./dev.db`
- **MySQL** - `mysql://user:password@localhost:3306/dbname`

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
```

Replace with your actual PostgreSQL credentials:
- `user` - Your PostgreSQL username
- `password` - Your PostgreSQL password
- `localhost:5432` - Your PostgreSQL host and port
- `mydb` - Your database name
- `schema=public` - Database schema (usually `public`)

**Example:**
```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/suresh_db?schema=public"
```

For local development with Docker (using docker-compose.yml):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/suresh_db?schema=public"
```

**Note:** If using `docker compose` (v2), use: `docker compose up -d`
If using `docker-compose` (v1), use: `docker-compose up -d`

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Migrations

Create and apply database migrations:

```bash
npm run prisma:migrate
```

This will:
- Create a new migration
- Apply it to the database
- Generate Prisma Client

### 5. Seed the Database (Optional)

Populate the database with initial data:

```bash
npm run prisma:seed
```

## Available Scripts

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and apply migrations (development)
- `npm run prisma:migrate:deploy` - Apply migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database

## Prisma Studio

View and edit your database data using Prisma Studio:

```bash
npm run prisma:studio
```

This opens a web interface at `http://localhost:5555`

## Schema Changes

When you modify `prisma/schema.prisma`:

1. Create a migration: `npm run prisma:migrate`
2. The migration will be applied automatically
3. Prisma Client will be regenerated

## Production Deployment

For production:

1. Set `DATABASE_URL` environment variable
2. Run migrations: `npm run prisma:migrate:deploy`
3. Generate client: `npm run prisma:generate`
4. Build: `npm run build`
5. Start: `npm start`

## Model: User

The current schema includes a `User` model with:
- `id` (UUID, primary key)
- `name` (String, required)
- `email` (String, unique, required)
- `age` (Int, optional)
- `password` (String, optional) - Should be hashed in production
- `createdAt` (DateTime, auto-generated)
- `updatedAt` (DateTime, auto-updated)

