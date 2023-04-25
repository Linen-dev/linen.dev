import compression from 'compression';
import cors from 'cors';
// import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import nextConnect from 'next-connect';
import { Sentry } from 'utilities/ssr-metrics';
import { passport } from 'server/auth';

export const init = nextConnect().use(
  morgan('tiny'),
  cors({ origin: '*' }) as any,
  hpp() as any,
  helmet(),
  compression() as any,
  // express.json(),
  // express.urlencoded({ extended: true }),
  passport.initialize() as any,
  Sentry.Handlers.requestHandler(),
  Sentry.Handlers.tracingHandler()
);

export default init;
