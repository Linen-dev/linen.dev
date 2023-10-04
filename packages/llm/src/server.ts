import express from 'express';
import z from 'zod';
import Linen from './linen';
import LangChain from './langchain';
import env from './utils/env';
import { Unauthorized } from './utils/error';

const app = express();

app.use((req, res, next) => {
  const authorizationHeader =
    req.headers instanceof Headers
      ? req.headers.get('x-api-internal')
      : req.headers['x-api-internal'];

  if (!authorizationHeader) {
    return next(new Unauthorized());
  }
  if (env.INTERNAL_API_KEY !== authorizationHeader) {
    return next(new Unauthorized());
  }
  return next();
});

app.use(express.json());

app.post('/predict', async (req, res, next) => {
  try {
    const body = z
      .object({
        communityName: z.string().min(1),
        query: z.string().min(1),
        threadId: z.string().uuid(),
        summarize: z.boolean().optional(),
      })
      .parse(req.body);
    console.log({ body });

    const community = await Linen.getCommunityInfo(body.communityName);
    const result = await LangChain.predict({
      query: body.query,
      typesenseApiKey: community.search.apiKey,
      communityName: community.name,
      accountId: community.id,
      summarize: false,
      threadId: body.threadId,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.use(async (err: any, req: any, res: express.Response, next: any) => {
  if (err instanceof Unauthorized) {
    console.log(err);
    res.status(err.status).json({ error: err.message });
  } else if (err instanceof z.ZodError) {
    console.log(err.issues);
    res.status(400).json(err.issues);
  } else {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

const PORT = process.env.LLM_PORT || 3001;

app.listen(PORT, () => {
  console.log(`listen ${PORT}`);
});
