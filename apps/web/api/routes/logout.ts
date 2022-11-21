import { createRouter } from 'next-connect';
import type { ApiResponse, AuthedApiRequest } from 'api/types';

const routes = createRouter<AuthedApiRequest, ApiResponse>()
  // GET /api/v2/logout
  .get('/logout', (req, res) => {
    // TODO: clean up refresh tokens
    req.logOut();
    res.status(204).end();
  });

export default routes;
