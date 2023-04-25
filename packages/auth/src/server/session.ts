import { verifyToken, JwtPayload, getToken } from './tokens';

async function _getValidToken(req: any) {
  if (typeof window !== 'undefined') return;

  const t = getToken(req);
  if (!t) {
    return null;
  }
  try {
    const session = (await verifyToken(t)) as JwtPayload;
    return { user: { ...session, ...session.data }, token: t };
  } catch (error) {
    return null;
  }
}

export async function getRawTokenFromRequest(req: any) {
  return (await _getValidToken(req))?.token || null;
}

export async function getValidSessionTokenFromRequest(req: any) {
  return (await _getValidToken(req))?.user || null;
}

function parseUser(session: any) {
  return {
    user: {
      ...session.data,
    },
    expires: new Date(session.exp * 1000).toISOString(),
  };
}

// SSR only
export async function getServerSession(req: any, _?: any) {
  try {
    const sessionCookie = getToken(req);
    if (!!sessionCookie) {
      try {
        const session = await verifyToken(sessionCookie);
        return parseUser(session);
      } catch (error) {}
    }
  } catch (error) {}
  return null;
}
