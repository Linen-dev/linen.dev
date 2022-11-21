import { createRouter } from 'next-connect';
import type { ApiResponse, AuthedApiRequest } from 'api/types';
import { signToken } from 'api/auth/passport';
import { z } from 'zod';
import {
  verifyRefresh,
  buildRefreshToken,
  verifyExpiredToken,
} from 'api/auth/refresh';
import { Unauthorized } from 'api/errors';
import type { JwtPayload } from 'jsonwebtoken';

const postSchema = z.object({
  refreshToken: z.string().min(1),
});

// improvement: rate limit
const routes = createRouter<AuthedApiRequest, ApiResponse>()
  // POST /api/v2/token
  .post('/token', async (req, res) => {
    const { refreshToken } = postSchema.parse(req.body);
    try {
      const isValid = verifyRefresh(refreshToken) as JwtPayload;
      const token = verifyExpiredToken(req) as JwtPayload | null;
      if (token?.data.id !== isValid.data.id) {
        throw new Error('Wrong user');
      }
      // TODO: we need to have a black list of used tokens
      const newToken = await signToken({ ...isValid.data });
      const newRefreshToken = await buildRefreshToken({ ...isValid.data });
      return res.json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
      console.error({ error });
      return Unauthorized(res);
    }
  });

export default routes;
