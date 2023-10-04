import { z } from 'zod';

const config = z
  .object({
    OPENAI_API_TOKEN: z.string(),
    REPLICATE_API_TOKEN: z.string(),
    TYPESENSE_URL: z.string().url(),
    AUTH_SERVICE_URL: z.string().url(), // linen server
    INTERNAL_API_KEY: z.string(),
    // we could assume that each chunk will have size of 768,
    // so we can call the api with "max_context_token" = CHUNK_SIZE * (CHUNKS - 1)
    CHUNK_SIZE: z.number().default(768),
    CHUNKS: z.number().default(10),
  })
  .safeParse(process.env);

if ('error' in config) {
  console.error(config.error);
  process.exit(1);
}

export default config.data;
