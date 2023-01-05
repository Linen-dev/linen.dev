import type { Response, NextFunction, Request } from 'server/types';
import { z } from 'zod';

export default function validationMiddleware(
  schema: z.Schema,
  value: 'body' | 'query' | 'params' = 'body' // DEPRECATE this param
) {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      req.body = schema.parse({ ...req.params, ...req.query, ...req.body });
      next();
    } catch (error) {
      next(error);
    }
  };
}
