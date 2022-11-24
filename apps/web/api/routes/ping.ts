import { Router, NextFunction, Response } from 'express';

const getPing = async (req: any, res: Response, next: NextFunction) => {
  try {
    res.json({ pong: true });
    next();
  } catch (error) {
    next(error);
  }
};

const PingRoute = Router()
  // routes
  .all('/ping', getPing);

export default PingRoute;
