# Validation Schemas

This directory contains Joi validation schemas for request validation.

## Usage Example

### 1. Create a validation schema

```typescript
// src/validations/userValidation.ts
import Joi from 'joi';

export const createUserSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(18).optional(),
  }),
};
```

### 2. Use in routes

```typescript
// src/routes/userRoutes.ts
import { Router } from 'express';
import { validate } from '../middlewares/validator';
import { createUserSchema } from '../validations';
import { createUser } from '../controllers/userController';

const router = Router();

router.post('/', validate(createUserSchema), createUser);

export default router;
```

## Validation Sources

The `validate` middleware supports three validation sources:

- **body**: Request body (POST, PUT, PATCH)
- **query**: Query parameters (GET)
- **params**: URL parameters (/:id)

## Example with Multiple Sources

```typescript
export const updateUserSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
  }),
  params: Joi.object({
    id: Joi.string().uuid().required(),
  }),
};
```

## Error Response Format

When validation fails, the response will be:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      "Name must be at least 2 characters long",
      "Email is required"
    ]
  }
}
```

