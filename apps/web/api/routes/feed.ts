import { Router, Response } from 'express';
import jwtMiddleware from 'api/middlewares/jwt';
import { index as indexMethod } from '../../pages/api/feed';

const index = async (request: any, response: Response) => {
  const userId = request.user.users[0].id;
  const { status, data } = await indexMethod({
    params: request.query,
    currentUserId: userId,
  });
  return response.status(status).json(data);
};

const router = Router();

router.get('/feed', jwtMiddleware, index);

export default router;
