import type { NextFunction, Request, Response } from 'express';
import { HttpException } from 'api/exceptions/HttpException';
import { ZodError } from 'zod';

const errorMiddleware = (
  error: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    error.status = error instanceof ZodError ? 400 : error.status || 500;

    console.error(
      `[${req.method}] ${req.path} >> StatusCode:: ${error.status}, Message:: ${error.message}`
    );

    if (error.status === 500) {
      error.message = 'Something went wrong';
    }

    res.status(error.status).json({ message: error.message });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;
