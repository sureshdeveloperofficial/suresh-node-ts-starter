import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

type ValidationSource = 'body' | 'query' | 'params';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}

export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    // Validate each source (body, query, params)
    Object.keys(schema).forEach((key) => {
      const source = key as ValidationSource;
      const joiSchema = schema[source];

      if (joiSchema) {
        const { error } = joiSchema.validate(req[source], {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          const errorMessages = error.details.map((detail) => detail.message);
          errors.push(...errorMessages);
        } else {
          // Replace the request data with validated (and potentially stripped) data
          req[source] = joiSchema.validate(req[source], { stripUnknown: true }).value;
        }
      }
    });

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors,
        },
      });
      return;
    }

    next();
  };
};

