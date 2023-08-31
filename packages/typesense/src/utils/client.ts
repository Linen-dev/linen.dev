import Typesense from 'typesense';
import { env } from './env';
import axios from 'axios';

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

const baseURL = env.isProd
  ? `https://${env.NEXT_PUBLIC_TYPESENSE_HOST}:443`
  : `http://${env.NEXT_PUBLIC_TYPESENSE_HOST}:8108`;

const instance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-TYPESENSE-API-KEY': env.TYPESENSE_ADMIN,
  },
});

export const updateByQuery = ({
  collection,
  filter_by,
  document,
}: {
  collection: string;
  filter_by: string;
  document: object;
}) =>
  instance.patch(
    `/collections/${collection}/documents?filter_by=${filter_by}`,
    document
  );

export const deleteByQuery = ({
  collection,
  filter_by,
}: {
  collection: string;
  filter_by: string;
}) =>
  instance.delete(
    `/collections/${collection}/documents?filter_by=${filter_by}`
  );
