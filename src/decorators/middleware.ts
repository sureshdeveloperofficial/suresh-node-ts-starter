import 'reflect-metadata';
import { RequestHandler } from 'express';
import { MIDDLEWARE_METADATA_KEY } from './controller';

/**
 * Use middleware decorator - applies middleware to controller methods
 */
export function Use(...middlewares: RequestHandler[]) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    if (propertyKey) {
      // Method-level middleware
      const existing = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target, propertyKey) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA_KEY,
        [...existing, ...middlewares],
        target,
        propertyKey
      );
    } else {
      // Class-level middleware
      const existing = Reflect.getMetadata(MIDDLEWARE_METADATA_KEY, target) || [];
      Reflect.defineMetadata(MIDDLEWARE_METADATA_KEY, [...existing, ...middlewares], target);
    }
  };
}

