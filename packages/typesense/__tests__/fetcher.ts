import { env } from '../src/utils/env';

const baseURL = `http://${env.NEXT_PUBLIC_TYPESENSE_HOST}:8108`;

export async function fetcher(apiKey: string, q: string) {
  const result = await fetch(`${baseURL}/multi_search`, {
    headers: {
      'Content-Type': 'application/json',
      'x-typesense-api-key': apiKey,
    },
    body: JSON.stringify({
      searches: [
        {
          query_by: 'body,channel_name,author_name,mentions_name',
          collection: env.TYPESENSE_DATABASE,
          q,
          page: 1,
        },
      ],
    }),
    method: 'POST',
  });
  return await result.json();
}
