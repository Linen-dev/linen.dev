import { z } from 'zod';
import { verifyCSRFToken } from '../csrf';
import { Request, Response, NextFunction } from 'express';

class InvalidCsrf extends Error {
  public status: number;
  public message: string;

  constructor(status = 400, message = 'InvalidCsrf') {
    super(message);
    this.status = status;
    this.message = message;
  }
}

const schema = z.object({
  csrfToken: z.string().min(1),
});

export default function csrfMiddleware(_?: never) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { csrfToken } = schema.parse(req.body);

      const csrfTokenVerified = verifyCSRFToken(csrfToken);

      if (csrfTokenVerified) {
        return next();
      } else {
        return next(new InvalidCsrf());
      }
    } catch (error) {
      return next(error);
    }
  };
}
