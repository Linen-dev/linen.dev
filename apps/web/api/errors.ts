import { ZodError } from 'zod';

export const NotFound = (res: any, error: any) => {
  res.status(404).json({ error });
};

export const AccountNotFound = (res: any) => {
  return NotFound(res, 'Account Not Found');
};

export const ChannelNotFound = (res: any) => {
  return NotFound(res, 'Channel Not Found');
};

export const Unauthorized = (res: any, cause?: any) => {
  res.status(401).json({ error: 'Unauthorized', cause });
};

export const Forbidden = (res: any, cause?: any) => {
  res.status(403).json({ error: 'Forbidden', cause });
};

export function onError(err: unknown, req: any, res: any) {
  console.error(err);
  // validation errors
  if (err instanceof ZodError) {
    res.status(400).json(err.issues);
  }
  res.status(500).end('Something went wrong!');
}

export function onNoMatch(req: any, res: any) {
  res.status(405).end();
}
