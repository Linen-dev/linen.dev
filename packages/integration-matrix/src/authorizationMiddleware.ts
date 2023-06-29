import { Request, Response, NextFunction } from 'express';
import { IConfig } from './IConfig';

export function authorizationMiddleware(config: IConfig) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization !== config.webhook.apikey) {
      res.status(401).json({ error: 'authorization mismatch' });
      return;
    }
    next();
  };
}
