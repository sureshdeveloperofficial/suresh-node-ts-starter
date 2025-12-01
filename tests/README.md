# Test Suite Documentation

This directory contains comprehensive test suites for the application using Vitest.

## Structure

```
tests/
├── setup.ts                 # Global test setup
├── helpers/                 # Test utilities and helpers
│   ├── testDb.ts           # Database test utilities
│   ├── testHelpers.ts      # General test helpers
│   ├── testApp.ts          # Express app factory
│   └── index.ts            # Exports
├── services/               # Service layer tests
│   ├── auth.service.test.ts
│   ├── user.service.test.ts
│   └── permission.service.test.ts
├── controllers/            # Controller layer tests
│   └── auth.controller.test.ts
└── utils/                  # Utility tests
    └── response.test.ts
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests once (CI mode)
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Configuration

Tests are configured in `vitest.config.ts`:
- Environment: Node.js
- Coverage provider: v8
- Setup file: `tests/setup.ts`
- Test timeout: 10 seconds

## Test Database

Tests use a separate test database configured via `TEST_DATABASE_URL` environment variable.

Default: `postgresql://postgres:postgres@localhost:5432/test_db`

## Writing Tests

### Service Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { YourService } from '@/services/yourService';
import { cleanDatabase, seedTestDatabase } from '../helpers/testDb';

describe('YourService', () => {
  beforeEach(async () => {
    await cleanDatabase();
    await seedTestDatabase();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Controller Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../helpers/testApp';
import { createTestUser, getAuthHeaders } from '../helpers/testHelpers';

describe('YourController', () => {
  let app: Express;

  beforeEach(async () => {
    app = await createApp();
  });

  it('should handle request', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set(getAuthHeaders(token));

    expect(response.status).toBe(200);
  });
});
```

## Test Helpers

### Database Helpers
- `cleanDatabase()` - Clean all test data
- `seedTestDatabase()` - Seed minimal test data
- `getTestDb()` - Get test database client
- `closeDatabase()` - Close database connection

### General Helpers
- `createTestUser()` - Create a test user
- `generateTestToken()` - Generate JWT token
- `generateTestRefreshToken()` - Generate refresh token
- `getAuthHeaders()` - Get authentication headers
- `wait()` - Wait for async operations

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean database between tests
3. **Setup**: Use `beforeEach` for test setup
4. **Teardown**: Use `afterEach` for cleanup
5. **Naming**: Use descriptive test names
6. **Assertions**: Use specific assertions
7. **Mocking**: Mock external dependencies when needed

## Coverage Goals

- Services: > 80%
- Controllers: > 70%
- Utils: > 90%
- Overall: > 75%

## Continuous Integration

Tests run automatically in CI/CD pipelines. Ensure:
- Test database is available
- Environment variables are set
- All tests pass before merging

