import { z } from 'zod';

const validationMiddleware = (
  schema: z.Schema,
  value: string | 'body' | 'query' | 'params' = 'body'
): any => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req[value]);
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default validationMiddleware;
