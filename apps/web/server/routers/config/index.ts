import { Router } from 'express';
import { onError } from 'server/middlewares/error';
import { matrixRouter } from './matrix';

const configRouter = Router().use(matrixRouter).use(onError);

export default configRouter;
