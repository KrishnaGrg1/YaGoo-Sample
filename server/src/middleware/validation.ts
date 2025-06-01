import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

interface ValidationSchemas {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
  headers?: ObjectSchema;
}

/**
 * Middleware to validate incoming request data using Joi schemas.
 * Supports validation of body, URL params, query string, and headers.
 *
 * @param validationSchemas - Object containing Joi schemas for each part of the request.
 * @returns Express middleware function.
 */
const validate = (validationSchemas: ValidationSchemas = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { body, params, query, headers } = validationSchemas;

    try {
      // Validate request body if schema provided
      if (body) {
        const { error } = body.validate(req.body, { abortEarly: false });
        if (error) throw error;
      }

      // Validate URL parameters if schema provided
      if (params) {
        const { error } = params.validate(req.params, { abortEarly: false });
        if (error) throw error;
      }

      // Validate query parameters if schema provided
      if (query) {
        const { error } = query.validate(req.query, { abortEarly: false });
        if (error) throw error;
      }

      // Validate headers if schema provided
      if (headers) {
        const { error } = headers.validate(req.headers, { abortEarly: false });
        if (error) throw error;
      }

      // Proceed if all validations pass
      next();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Validation error:', error);
        res.status(400).json({
          error: error.message,
          details: (error as any)?.details || null,
        });
      } else {
        console.error('Unexpected validation error:', error);
        res.status(500).json({ error: 'An unexpected error occurred during validation' });
      }
    }
  };
};

export default validate;
