import 'reflect-metadata';
import { RequestHandler } from 'express';
import { validate, ValidationSchema } from '../middlewares/validator';

export const VALIDATE_METADATA_KEY = Symbol('validate');

/**
 * Validation decorator - applies Joi validation to route handlers
 */
export function Validate(schema: ValidationSchema) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const validationMiddleware = validate(schema);
    
    // Store validation middleware in metadata
    const existing: RequestHandler[] =
      Reflect.getMetadata(VALIDATE_METADATA_KEY, target, propertyKey) || [];
    
    Reflect.defineMetadata(
      VALIDATE_METADATA_KEY,
      [...existing, validationMiddleware],
      target,
      propertyKey
    );
  };
}

