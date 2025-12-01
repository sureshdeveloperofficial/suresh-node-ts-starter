import 'reflect-metadata';
import { RequestHandler } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { MIDDLEWARE_METADATA_KEY } from './controller';

export const AUTH_METADATA_KEY = Symbol('auth');
export const ROLES_METADATA_KEY = Symbol('roles');

/**
 * Authentication decorator - requires user to be authenticated
 * Can be used at class or method level
 */
export function Auth() {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey) {
      // Method-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, authenticate],
        target,
        propertyKey
      );
    } else {
      // Class-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, authenticate], target);
    }
  };
}

/**
 * Role-based authorization decorator
 * @param roles - Array of allowed roles
 */
export function Roles(...roles: string[]) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    const authMiddleware = authorize(...roles);
    if (propertyKey) {
      // Method-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, authMiddleware],
        target,
        propertyKey
      );
    } else {
      // Class-level
      const existing: RequestHandler[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, authMiddleware], target);
    }
  };
}

