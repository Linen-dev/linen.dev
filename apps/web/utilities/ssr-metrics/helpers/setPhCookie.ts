import { serialize } from 'cookie';

export function setPhCookie(res: any, value: string) {
  const setCookieHeader: string[] = [];
  const existCookieHeader = res?.getHeader('Set-Cookie') || [];
  if (Array.isArray(existCookieHeader)) {
    setCookieHeader.push(...existCookieHeader);
  }
  setCookieHeader.push(
    serialize('user-session', value, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60,
    })
  );
  res?.setHeader('Set-Cookie', setCookieHeader);
}
