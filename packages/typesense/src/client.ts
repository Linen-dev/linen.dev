import Typesense from 'typesense';
import { env } from './env';

export const client = new Typesense.Client({
  nodes: [
    {
      host: env.NEXT_PUBLIC_TYPESENSE_HOST,
      port: env.isProd ? 443 : 8108,
      path: '',
      protocol: env.isProd ? 'https' : 'http',
    },
  ],
  apiKey: env.TYPESENSE_ADMIN,
  connectionTimeoutSeconds: 60 * 5,
});
