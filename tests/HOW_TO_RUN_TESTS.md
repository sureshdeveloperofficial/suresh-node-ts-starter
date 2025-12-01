# How to Run and Check Test Cases

## Quick Start

### Run All Tests
```bash
npm test
```
This runs tests in **watch mode** - tests will automatically re-run when you change files.

### Run Tests Once (CI Mode)
```bash
npm run test:run
```
This runs all tests once and exits. Perfect for CI/CD pipelines.

### Run Tests with Coverage Report
```bash
npm run test:coverage
```
This generates a coverage report showing which parts of your code are tested.

### Run Tests with UI (Interactive)
```bash
npm run test:ui
```
Opens an interactive web UI where you can:
- See test results visually
- Filter tests
- Debug failed tests
- See coverage reports

### Run Tests in Watch Mode
```bash
npm run test:watch
```
Same as `npm test` - runs tests and watches for file changes.

## Running Specific Tests

### Run a Specific Test File
```bash
npm test tests/services/auth.service.test.ts
```

### Run Tests Matching a Pattern
```bash
npm test -- --grep "register"
```
Runs only tests with "register" in their name.

### Run Tests in a Specific Directory
```bash
npm test tests/services/
```

## Understanding Test Output

### Successful Test
```
✓ should register a new user successfully 5ms
```

### Failed Test
```
× should register a new user 109ms
Error: User with this email already exists
```

### Test Summary
```
Test Files  5 passed (5)
     Tests  49 passed | 2 failed (51)
```

## Checking Test Results

### 1. Terminal Output
After running tests, you'll see:
- ✅ Green checkmarks for passed tests
- ❌ Red X for failed tests
- Summary of total tests passed/failed

### 2. Coverage Report
After running `npm run test:coverage`, check:
- Terminal output showing coverage percentages
- `coverage/` folder with HTML reports
- Open `coverage/index.html` in browser for detailed view

### 3. Test UI
After running `npm run test:ui`:
- Opens browser at `http://localhost:51204/__vitest__/`
- Visual dashboard with all test results
- Click on any test to see details

## Common Test Commands

```bash
# Run all tests
npm test

# Run tests once (no watch)
npm run test:run

# Run with coverage
npm run test:coverage

# Run specific file
npm test auth.service.test.ts

# Run tests matching pattern
npm test -- --grep "login"

# Run tests in watch mode
npm run test:watch

# Open test UI
npm run test:ui
```

## Troubleshooting

### Tests Not Running
1. Check if database is running:
   ```bash
   # Check PostgreSQL
   psql -U postgres -c "SELECT version();"
   
   # Check Redis (optional)
   redis-cli ping
   ```

2. Check environment variables:
   ```bash
   # Make sure .env file exists with DATABASE_URL
   cat .env | grep DATABASE_URL
   ```

### Database Connection Errors
If you see `Database does not exist`:
- Use existing database: Tests will use `DATABASE_URL` from `.env`
- Or create test database: See `TEST_SETUP.md`

### Tests Failing
1. Check the error message in terminal
2. Look at the stack trace to find the failing line
3. Check if database is properly seeded
4. Verify environment variables are set correctly

## Best Practices

1. **Run tests before committing**:
   ```bash
   npm run test:run
   ```

2. **Check coverage regularly**:
   ```bash
   npm run test:coverage
   ```

3. **Use watch mode during development**:
   ```bash
   npm test
   ```

4. **Fix failing tests immediately** - Don't let them accumulate

## Example Workflow

```bash
# 1. Start development with tests watching
npm test

# 2. Make code changes
# Tests automatically re-run

# 3. Before committing, run full test suite
npm run test:run

# 4. Check coverage
npm run test:coverage

# 5. Commit if all tests pass
git add .
git commit -m "Add new feature"
```

## Test Output Examples

### Passing Tests
```
✓ tests/services/auth.service.test.ts (12 tests) 1150ms
  ✓ AuthService > register > should register a new user successfully
  ✓ AuthService > login > should login user with correct credentials
```

### Failing Tests
```
× tests/services/auth.service.test.ts > AuthService > register > should register a new user
  Error: User with this email already exists
    at AuthService.register (src/services/auth.service.ts:120:15)
```

### Coverage Report
```
Test Files  5 passed (5)
     Tests  49 passed (49)
  Coverage: 85.23%
```



