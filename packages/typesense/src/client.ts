import Typesense from 'typesense';
import { env } from './env';

export const client = new Typesense.Client({
  nodes: [
    {
      host: env.NEXT_PUBLIC_TYPESENSE_HOST,
      port: 443,
      path: '',
      protocol: 'https',
    },
  ],
  apiKey: env.TYPESENSE_ADMIN,
  connectionTimeoutSeconds: 60 * 5,
});
