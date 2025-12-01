# Test Setup Guide

## Database Configuration

Tests can use either a separate test database or the main development database.

### Option 1: Use Separate Test Database (Recommended)

1. Create a test database:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE test_db;
\q
```

2. Set environment variable:
```bash
export TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db?schema=public"
```

Or add to `.env`:
```env
TEST_DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db?schema=public"
```

3. Run migrations on test database:
```bash
DATABASE_URL=$TEST_DATABASE_URL npm run prisma:migrate
```

### Option 2: Use Main Database (Quick Start)

If `TEST_DATABASE_URL` is not set, tests will automatically use `DATABASE_URL` from your `.env` file.

**Warning**: This will use your development database. Tests clean up data between runs, but use with caution.

## Running Tests

```bash
# Run all tests
npm test

# Run tests once (CI mode)
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

## Test Database Cleanup

Tests automatically clean up data between runs using `cleanDatabase()`. This ensures test isolation.

## Troubleshooting

### Database Connection Errors

If you see `Database 'test_db' does not exist`:
1. Create the test database (see Option 1 above)
2. Or ensure `DATABASE_URL` is set in your `.env` file (Option 2)

### Permission Errors

Ensure your PostgreSQL user has permissions to create databases and tables.

### Migration Errors

Run migrations on the test database:
```bash
DATABASE_URL=$TEST_DATABASE_URL npm run prisma:migrate
```

