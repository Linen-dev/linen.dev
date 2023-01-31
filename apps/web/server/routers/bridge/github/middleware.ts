import { NextFunction, Request, Response } from 'express';
import env from './config';

function getInternalApiKey(req: any) {
  const authorizationHeader = req.headers['x-api-internal'];
  if (!authorizationHeader) return null;
  return decodeURIComponent(authorizationHeader);
}

export default function integrationMiddleware(_?: never) {
  return async (req: Request, _: Response, next: NextFunction) => {
    try {
      const apiKeyRaw = getInternalApiKey(req);
      if (!apiKeyRaw) {
        return next(new Error('missing api key'));
      }
      if (env.INTERNAL_API_KEY !== apiKeyRaw) {
        return next(new Error('api key does not match'));
      }
      return next();
    } catch (error) {
      console.error(error);
      return next(new Error('internal server error'));
    }
  };
}
