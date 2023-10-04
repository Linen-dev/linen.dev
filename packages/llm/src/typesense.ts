import axios from 'axios';
import env from './utils/env';
import { measure } from './utils/measure';

type ResponseT = {
  results: {
    hits: { document: { body: string; id: string } }[];
  }[];
};

const FILTERED_WORDS = ['the', 'me', 'I', 'a', 'an', 'is', 'how', 'what'];

export function toKeywords(query: string) {
  return query
    .replace(/!|\?/g, '')
    .split(/\s+/g)
    .filter((word) => !FILTERED_WORDS.includes(word))
    .map((word) => word.toLocaleLowerCase())
    .join(' ');
}

export default class Typesense {
  @measure
  static async queryThreads({
    query,
    apiKey,
  }: {
    query: string;
    apiKey: string;
  }) {
    const res: ResponseT = await axios
      .post(
        env.TYPESENSE_URL,
        {
          searches: [
            {
              query_by: 'body',
              collection: 'threads',
              q: toKeywords(query),
              page: 1,
              highlight_fields: 'none',
              include_fields: 'body,id',
              // exhaustive_search: true,
              prefix: false,
              limit: env.CHUNKS,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-typesense-api-key': apiKey,
          },
          timeout: 60 * 1000,
        }
      )
      .then((res) => res.data)
      .catch((res) => console.error('%j', res));

    return res.results
      .map((r) =>
        r.hits
          .map((h) => {
            return {
              body: h.document.body,
              id: h.document.id,
            };
          })
          .flat()
      )
      .flat();
  }
}
