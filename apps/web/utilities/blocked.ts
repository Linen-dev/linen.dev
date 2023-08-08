import type { NextRequest } from 'next/server';
import type { NextApiRequest } from 'next';

const BLACK_LIST_IP = (process.env.BLACK_LIST_IP || '')
  .split('\n')
  .map((e) => e.trim())
  .filter((e) => !!e);

const BLACK_LIST_REFERER = (process.env.BLACK_LIST_REFERER || '')
  .split('\n')
  .map((e) => e.trim())
  .filter((e) => !!e);

function getIP(request: Request | NextApiRequest) {
  const xff =
    request instanceof Request
      ? request.headers.get('x-forwarded-for')
      : request.headers['x-forwarded-for'];

  return xff ? (Array.isArray(xff) ? xff[0] : xff.split(',')[0]) : '127.0.0.1';
}

function getReferer(request: Request | NextApiRequest) {
  const xff =
    request instanceof Request
      ? request.headers.get('referer')
      : request.headers['referer'];

  return xff ? (Array.isArray(xff) ? xff[0] : xff.split(',')[0]) : '';
}

export async function blocked(request: NextRequest) {
  if (BLACK_LIST_IP.includes(getIP(request))) {
    return true;
  }
  if (BLACK_LIST_REFERER.includes(getReferer(request))) {
    return true;
  }
  return false;
}
