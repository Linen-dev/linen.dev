import { cleanEnv, num, str, url } from 'envalid';

export const env = cleanEnv(process.env, {
  REPLICATE_API_TOKEN: str(),
  TYPESENSE_URL: url(),
  OPENAI_API_TOKEN: str(),
  INTERNAL_API_KEY: str(),

  // we could assume that each chunk will have size of 768,
  // so we can call the api with "max_context_token" = CHUNK_SIZE * (CHUNKS - 1)
  CHUNK_SIZE: num({ default: 768 }),
  CHUNKS: num({ default: 20 }),
});
