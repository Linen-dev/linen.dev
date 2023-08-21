import compression from 'compression';
import cors from 'cors';
// import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import nextConnect from 'next-connect';
import { passport } from 'server/auth';

export const init = nextConnect().use(
  morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }),
  cors({ origin: '*' }) as any,
  hpp() as any,
  helmet(),
  compression() as any,
  // express.json(),
  // express.urlencoded({ extended: true }),
  passport.initialize() as any
);

export default init;
