import type { Response, NextFunction, Request } from '@linen/types';

export default function validationMiddleware(
  schema: any,
  value: 'body' | 'query' | 'params' = 'body' // DEPRECATE this param
) {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      req.body = schema.parse({ ...req.params, ...req.query, ...req.body });
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
