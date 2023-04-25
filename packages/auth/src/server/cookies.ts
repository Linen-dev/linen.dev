import { CookieSerializeOptions, serialize } from 'cookie';
import { cookiesName } from './constraints';

interface Cookie {
  name: string;
  value: string;
  options: CookieSerializeOptions;
}

export class CookieStore {
  store: Record<string, Cookie>;
  constructor(cookies?: Record<string, string>) {
    this.store =
      (cookies &&
        Object.entries(cookies).reduce(
          (prev, [name, value]) => ({
            ...prev,
            [name]: { name, value },
          }),
          {}
        )) ||
      {};
  }
  add(name: string, cookie: Cookie) {
    this.store = {
      ...this.store,
      [name]: cookie,
    };
  }
  map(callbackfn: (value: Cookie) => unknown) {
    return Object.values(this.store).map(callbackfn);
  }
}

function setCookie(res: any, cookie: Cookie) {
  // Preserve any existing cookies that have already been set in the same session
  let setCookieHeader = res?.getHeader('Set-Cookie') ?? [];
  // If not an array (i.e. a string with a single cookie) convert it into an array
  if (!Array.isArray(setCookieHeader)) {
    setCookieHeader = [setCookieHeader];
  }
  const { name, value, options } = cookie;
  const cookieHeader = serialize(name, value, options);
  setCookieHeader.push(cookieHeader);
  res?.setHeader('Set-Cookie', setCookieHeader);
}

function buildCookie({
  cookieName,
  value,
  maxAge = 30 * 24 * 60 * 60, // 30 days
  secureCookie,
}: {
  cookieName: string;
  value: string;
  maxAge?: number;
  secureCookie?: boolean;
}) {
  return {
    name: cookieName,
    value,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: secureCookie,
      maxAge,
    } as CookieSerializeOptions,
  };
}

export function setSessionCookies({
  token,
  req,
  res,
  maxAge,
}: {
  token: string;
  req: any;
  res: any;
  maxAge?: number;
}) {
  const store = new CookieStore();
  const { cookieName, secureCookie } = buildCookieName(cookiesName.session);

  store.add(
    cookieName,
    buildCookie({
      value: token,
      cookieName,
      secureCookie,
      maxAge,
    })
  );

  store.map((cookie) => setCookie(res, cookie));
}

export function expireSessionCookies({ req, res }: { req: any; res: any }) {
  setSessionCookies({ token: '', req, res, maxAge: 0 });
}

export function buildCookieName(name: string) {
  const secureCookie = process.env.NODE_ENV === 'production';
  const cookieName = secureCookie ? `__Secure-${name}` : `${name}`;
  return { cookieName, secureCookie };
}
