import type { IncomingHttpHeaders } from 'http';

export function getIp(headers: IncomingHttpHeaders) {
  try {
    let ip = headers['x-real-ip'];
    if (!ip) {
      const forwardedFor = headers['x-forwarded-for'];
      if (Array.isArray(forwardedFor)) {
        ip = forwardedFor.at(0);
      } else {
        ip = forwardedFor?.split(',').at(0) || undefined;
      }
    }
    return ip;
  } catch (error) {}
}
