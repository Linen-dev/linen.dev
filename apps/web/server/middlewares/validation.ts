import type { Response, NextFunction, Request } from 'server/types';
import { z } from 'zod';

export default function validationMiddleware(
  schema: z.Schema,
  value: 'body' | 'query' = 'body'
) {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req[value]);
      next();
    } catch (error) {
      next(error);
    }
  };
}
