import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { cleanDatabase, seedTestDatabase, closeDatabase } from '../helpers/testDb';
import { createTestUser } from '../helpers/testHelpers';
import { createApp } from '../helpers/testApp';
import { config } from '@/config';

describe('AuthController', () => {
  let app: express.Application;

  beforeEach(async () => {
    await cleanDatabase();
    await seedTestDatabase();
    app = await createApp();
  });

  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe(`POST ${config.apiPrefix}/auth/register`, () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post(`${config.apiPrefix}/auth/register`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPassword123',
          age: 25,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post(`${config.apiPrefix}/auth/register`)
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for weak password', async () => {
      const response = await request(app)
        .post(`${config.apiPrefix}/auth/register`)
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
    });

    it('should return error if user already exists', async () => {
      await createTestUser({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123',
      });

      const response = await request(app)
        .post(`${config.apiPrefix}/auth/register`)
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });
  });

  describe(`POST ${config.apiPrefix}/auth/login`, () => {
    it('should login with correct credentials', async () => {
      await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
      });

      const response = await request(app)
        .post(`${config.apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: 'TestPassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens).toBeDefined();
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should return error for incorrect password', async () => {
      await createTestUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'CorrectPassword123',
      });

      const response = await request(app)
        .post(`${config.apiPrefix}/auth/login`)
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app)
        .post(`${config.apiPrefix}/auth/login`)
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});

