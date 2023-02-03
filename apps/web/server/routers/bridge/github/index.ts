import { createNodeMiddleware } from 'octokit';
import { Router } from 'express';
import githubApp from './github';
import linenRouter from './linen';

const prefix = '/api/bridge/github';

export const bridgeGithubRouter = Router()
  .use(
    createNodeMiddleware(githubApp, {
      pathPrefix: `${prefix}/in`,
    })
  )
  .use(`${prefix}/out`, linenRouter)
  .get(`${prefix}/setup`, (req, res) => {
    console.log('req.query', req.query);
    console.log('req.params', req.params);
    console.log('req.path', req.path);
    res.redirect('https://linen.dev');
  });
