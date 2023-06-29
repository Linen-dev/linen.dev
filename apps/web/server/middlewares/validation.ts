import type { Response, NextFunction, Request } from '@linen/types';

export default function validationMiddleware(
  schema: any,
  value: 'body' | 'query' | 'params' = 'body' // DEPRECATE this param
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse({ ...req.params, ...req.query, ...req.body });
      return next();
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  };
}
