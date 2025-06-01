import { Request, Response, NextFunction } from 'express';

/**
 * Global error-handling middleware for Express.
 * Logs the error stack and sends a generic 500 response.
 *
 * @param err - The error object caught in the middleware chain
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The next middleware function in the chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error stack trace to the console
  console.error(err.stack);

  // Send a generic error response with status 500
  res.status(500).json({ error: 'Something went wrong!' });
};
