import { RequestHandler } from 'express';
import { z } from 'zod';

const validationMiddleware = (
  schema: z.Schema,
  value: string | 'body' | 'query' | 'params' = 'body'
): RequestHandler => {
  return (req: any, res, next) => {
    try {
      schema.parse(req[value]);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validationMiddleware;
