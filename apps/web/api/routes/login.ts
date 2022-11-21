import { createRouter } from 'next-connect';
import passport from 'passport';
import type { ApiResponse, AuthedApiRequest } from 'api/types';
import { login } from 'api/auth/passport';
import { buildRefreshToken } from 'api/auth/refresh';

const localMiddleware = passport.authenticate('local', { session: false });

// improvement: rate limit
const routes = createRouter<AuthedApiRequest, ApiResponse>()
  // POST /api/v2/login
  .post('/login', localMiddleware, async (req, res) => {
    const token = await login(req, req.user);
    const refreshToken = await buildRefreshToken(req.user);
    return res.json({ token, refreshToken });
  });

export default routes;
