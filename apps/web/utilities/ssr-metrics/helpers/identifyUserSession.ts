import type { GetServerSidePropsContext } from 'next/types';
import { setPhCookie } from './setPhCookie';
import { v4 } from 'uuid';

export function identifyUserSession({
  query,
  req,
  res,
}: Partial<GetServerSidePropsContext>) {
  const phId = Array.isArray(query?.phId) ? query?.phId.at(0) : query?.phId;
  const cookie = req?.cookies?.['user-session'];
  if (cookie && !phId) {
    setPhCookie(res, cookie);
    return cookie;
  }
  if (cookie && phId && cookie === phId) {
    setPhCookie(res, cookie);
    return cookie;
  }
  const value = phId || v4();
  setPhCookie(res, value);
  return value;
}
