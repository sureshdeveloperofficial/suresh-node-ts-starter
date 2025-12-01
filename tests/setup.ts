import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Setup test environment
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  
  // Use TEST_DATABASE_URL if set, otherwise fall back to DATABASE_URL
  // This allows tests to run against the main database if test_db doesn't exist
  if (!process.env.TEST_DATABASE_URL) {
    // Use existing DATABASE_URL from .env if available
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  No DATABASE_URL or TEST_DATABASE_URL found. Tests may fail.');
    }
  }
  
  // Set JWT secrets for testing (only if not already set)
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-for-testing-only';
  }
  
  // Set Redis URL (only if not already set)
  if (!process.env.REDIS_URL && !process.env.TEST_REDIS_URL) {
    process.env.REDIS_URL = 'redis://localhost:6379';
  }
});

afterAll(async () => {
  // Cleanup after all tests
});

beforeEach(async () => {
  // Setup before each test
});

afterEach(async () => {
  // Cleanup after each test
});

