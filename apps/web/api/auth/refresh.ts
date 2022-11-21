import jwt from 'jsonwebtoken';

export const buildRefreshToken = (user: any) => {
  return jwt.sign({ data: user }, process.env.NEXTAUTH_SECRET!, {
    expiresIn: '30d',
  });
};

export function verifyRefresh(token: string) {
  return jwt.verify(token, process.env.NEXTAUTH_SECRET!);
}

export function verifyExpiredToken(request: any) {
  const authHeader =
    request.headers['authorization'] || request.headers['Authorization'];
  if (authHeader) {
    if (typeof authHeader !== 'string') {
      return null;
    }
    const matches = authHeader.match(/(\S+)\s+(\S+)/);
    if (matches?.length && matches?.length > 2 && matches?.[2]) {
      return jwt.decode(matches[2]);
    }
  }
  return null;
}
