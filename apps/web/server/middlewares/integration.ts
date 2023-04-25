import { Request, NextFunction } from '@linen/types';
import { Unauthorized } from 'server/exceptions';
import { stringify } from 'superjson';

function getInternalApiKey(req: any) {
  const authorizationHeader =
    req.headers instanceof Headers
      ? req.headers.get('x-api-internal')
      : req.headers['x-api-internal'];

  if (!authorizationHeader) return null;
  return decodeURIComponent(authorizationHeader);
}

export default function integrationMiddleware(_?: never) {
  return async (req: Request, _: any, next: NextFunction) => {
    try {
      const apiKeyRaw = getInternalApiKey(req);
      if (!apiKeyRaw) {
        return next(new Unauthorized());
      }
      if (!process.env.INTERNAL_API_KEY) {
        return next(new Error());
      }
      if (process.env.INTERNAL_API_KEY !== apiKeyRaw) {
        return next(new Unauthorized());
      }
      return next();
    } catch (error) {
      console.error(stringify(error));
      return next(new Unauthorized());
    }
  };
}
