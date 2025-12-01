import { describe, it, expect, vi } from 'vitest';
import { Response } from 'express';
import { sendSuccess, sendError } from '@/utils/response';

describe('Response Utils', () => {
  describe('sendSuccess', () => {
    it('should send success response with default status', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { data: 'test' }, 'Success message');

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Success message',
        data: { data: 'test' },
      });
    });

    it('should send success response with custom status', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { data: 'test' }, 'Created', 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created',
        data: { data: 'test' },
      });
    });
  });

  describe('sendError', () => {
    it('should send error response with default status', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendError(mockRes, 'Error message');

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Error message',
      });
    });

    it('should send error response with custom status', () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendError(mockRes, 'Not found', 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: 'Not found',
      });
    });
  });
});

