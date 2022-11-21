import { createRouter } from 'next-connect';
import type { ApiResponse, AuthedApiRequest } from 'api/types';
import { authMiddleware } from 'api/middlewares/auth';

const routes = createRouter<AuthedApiRequest, ApiResponse>()
  // GET /api/v2/me
  .get(
    '/me',
    // using authMiddleware jwt header will be required
    authMiddleware,
    (req, res) => {
      return res.json(req.user);
    }
  );

export default routes;
