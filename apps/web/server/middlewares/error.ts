import { ZodError } from 'zod';
import { expireSessionCookies } from 'utilities/auth/server/cookies';

export function onError(error: any, req: any, res: any) {
  if (error.message === 'jwt expired') {
    try {
      expireSessionCookies({ req, res });
    } catch (error) {}
  }

  error.status = error instanceof ZodError ? 400 : error.status || 500;

  const path = !!req.baseUrl ? req.baseUrl + req.path : req.url;

  console.error(
    `[${req.method}] ${path} >> StatusCode:: ${error.status}, Message:: ${error.message}`
  );

  if (error.status === 500) {
    error.message = 'Something went wrong';
  }

  res.status(error.status).json({ message: error.message });
}

export function onNoMatch(req: any, res: any) {
  res.status(404).json({ message: 'Not Found' });
}
