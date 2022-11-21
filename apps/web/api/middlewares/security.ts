import type { ApiRequest, ApiResponse } from 'api/types';

// https://github.com/shieldfy/API-Security-Checklist#output
export const securityMiddleware = async (
  _: ApiRequest,
  res: ApiResponse,
  next: any
) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'deny');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};
