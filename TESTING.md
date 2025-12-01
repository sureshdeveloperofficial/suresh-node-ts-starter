# Testing Guide

This project uses **Vitest** for comprehensive testing with a scalable, professional structure.

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Test Structure

```
tests/
├── setup.ts                    # Global test configuration
├── helpers/                     # Reusable test utilities
│   ├── testDb.ts               # Database helpers
│   ├── testHelpers.ts         # General helpers
│   ├── testApp.ts             # Express app factory
│   └── index.ts               # Exports
├── services/                   # Service layer tests
│   ├── auth.service.test.ts
│   ├── user.service.test.ts
│   └── permission.service.test.ts
├── controllers/                # Controller layer tests
│   └── auth.controller.test.ts
└── utils/                      # Utility tests
    └── response.test.ts
```

## Test Configuration

### Vitest Config (`vitest.config.ts`)
- **Environment**: Node.js
- **Coverage**: v8 provider
- **Setup**: `tests/setup.ts`
- **Timeout**: 10 seconds
- **Path Aliases**: `@/` for `src/`, `@tests/` for `tests/`

### Environment Variables

Tests use separate environment variables:
- `TEST_DATABASE_URL` - Test database connection
- `JWT_SECRET` - JWT secret for testing
- `JWT_REFRESH_SECRET` - Refresh token secret
- `TEST_REDIS_URL` - Test Redis connection (optional)

## Writing Tests

### Service Tests Example

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '@/services/auth.service';
import { cleanDatabase, seedTestDatabase } from '../helpers/testDb';

describe('AuthService', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await seedTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should register a new user', async () => {
    const user = await AuthService.register({
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Controller Tests Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/testApp';
import { createTestUser, getAuthHeaders } from '../helpers/testHelpers';

describe('AuthController', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  it('should login user', async () => {
    await createTestUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Test Helpers

### Database Helpers (`testDb.ts`)
- `getTestDb()` - Get test database client
- `cleanDatabase()` - Clean all test data
- `seedTestDatabase()` - Seed minimal test data
- `closeDatabase()` - Close database connection

### General Helpers (`testHelpers.ts`)
- `createTestUser()` - Create a test user with role
- `generateTestToken()` - Generate JWT token
- `generateTestRefreshToken()` - Generate refresh token
- `getAuthHeaders()` - Get authentication headers
- `wait()` - Wait for async operations
- `createMockRedis()` - Create mock Redis client

### App Factory (`testApp.ts`)
- `createApp()` - Create Express app for testing

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean database between tests
3. **Setup/Teardown**: Use `beforeEach`/`afterEach` hooks
4. **Naming**: Use descriptive test names
5. **Assertions**: Use specific, meaningful assertions
6. **Mocking**: Mock external dependencies when needed
7. **Coverage**: Aim for >75% overall coverage

## Coverage Goals

- **Services**: >80%
- **Controllers**: >70%
- **Utils**: >90%
- **Overall**: >75%

## Running Specific Tests

```bash
# Run specific test file
npm test auth.service.test.ts

# Run tests matching pattern
npm test -- --grep "register"

# Run tests in specific directory
npm test tests/services/
```

## CI/CD Integration

Tests run automatically in CI/CD pipelines. Ensure:
- Test database is available
- Environment variables are set
- All tests pass before merging

## Troubleshooting

### Database Connection Issues
- Ensure test database is running
- Check `TEST_DATABASE_URL` environment variable
- Verify database credentials

### Test Timeouts
- Increase timeout in `vitest.config.ts`
- Check for slow database queries
- Verify network connectivity

### Import Errors
- Check path aliases in `vitest.config.ts`
- Verify TypeScript configuration
- Ensure all dependencies are installed

## Next Steps

1. Add more controller tests
2. Add integration tests
3. Add E2E tests
4. Set up test coverage reporting
5. Add performance tests

