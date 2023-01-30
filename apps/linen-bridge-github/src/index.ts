import express from 'express';
import { createNodeMiddleware } from 'octokit';
import env from './config';
import githubApp from './github';
import linenRouter from './linen';

const expressApp = express();
expressApp.use(createNodeMiddleware(githubApp));
expressApp.use(`/api/linen`, linenRouter);

expressApp.get('/api/setup', (req, res) => {
  console.log('req.query', req.query);
  console.log('req.params', req.params);
  console.log('req.path', req.path);
  res.send(200);
});

expressApp.get('/api/health', (req, res) => {
  res.sendStatus(200);
});

expressApp.listen(env.PORT, () => {
  console.log(`app listening at http://localhost:${env.PORT}`);
});
