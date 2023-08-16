import { client } from './utils/client';
import { createSearchOnlyKey } from './utils/keys';
import { collectionSchema } from './utils/model';

(async () => {
  await client.collections().create(collectionSchema);
  const key = await createSearchOnlyKey(collectionSchema.name);
  console.log('search-only api-key ::', key.value);
})();
