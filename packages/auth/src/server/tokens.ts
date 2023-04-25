import { buildCookieName, CookieStore, setSessionCookies } from './cookies';
export type JwtPayload = jose.JWTPayload & { data: any };
import * as jose from 'jose';
import hkdf from '@panva/hkdf';
import { v4 as uuid } from 'uuid';
import { cookiesName, DEFAULT_MAX_AGE } from './constraints';

const now = () => (Date.now() / 1000) | 0;

/** Issues a JWT. By default, the JWT is encrypted using "A256GCM". */
async function encode(user: any) {
  const encryptionSecret = await getDerivedEncryptionKey(
    process.env.NEXTAUTH_SECRET!
  );
  return await new jose.EncryptJWT({ data: user })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(now() + DEFAULT_MAX_AGE)
    .setJti(uuid())
    .encrypt(encryptionSecret);
}

/** Decodes a NextAuth.js issued JWT. */
async function decode(token: string): Promise<JwtPayload | null> {
  if (!token) return null;
  const encryptionSecret = await getDerivedEncryptionKey(
    process.env.NEXTAUTH_SECRET!
  );
  const { payload } = await jose.jwtDecrypt(token, encryptionSecret, {
    clockTolerance: 15,
  });
  return payload as JwtPayload;
}

async function getDerivedEncryptionKey(secret: string | Buffer) {
  return await hkdf('sha256', secret, '', 'Linen Generated Encryption Key', 32);
}

export async function signToken(user: any) {
  return encode(user);
}

export async function verifyToken(token: string) {
  return decode(token);
}

export function getToken(req: any, cookieName = cookiesName.session) {
  if (!req) {
    throw new Error('Must pass `req` to JWT getToken()');
  }

  const { cookieName: _cookieName } = buildCookieName(cookieName);

  const sessionStore = new CookieStore(req.cookies);
  let token = sessionStore.store[_cookieName]?.value;

  const authorizationHeader = req.headers.authorization;

  if (!token && authorizationHeader?.split(' ')[0] === 'Bearer') {
    const urlEncodedToken = authorizationHeader.split(' ')[1];
    token = decodeURIComponent(urlEncodedToken);
  }

  if (!token) return null;
  return token;
}

// let usedTokens: Record<string, boolean> = {};

export async function refreshTokenAction(req: any, res: any) {
  const token = getToken(req);
  if (!token) {
    throw new Error('Token not found');
  }

  // if (usedTokens[token]) {
  //   throw new Error('Token already used');
  // }

  const isValid = (await verifyToken(token)) as JwtPayload;
  const newToken = await signToken(isValid.data);

  // TODO: add refreshToken used on some external black-list
  // usedTokens[token] = true;

  // persist cookies for SSR
  setSessionCookies({
    token: newToken,
    req,
    res,
  });

  return { newToken };
}
