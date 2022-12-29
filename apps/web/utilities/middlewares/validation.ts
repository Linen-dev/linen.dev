import type { Response, NextFunction, Request } from 'express';
import { z } from 'zod';

const validationMiddleware = (
  schema: z.Schema,
  value: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      schema.parse(req[value]);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validationMiddleware;
