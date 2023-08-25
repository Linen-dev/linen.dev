import { client } from './utils/client';
import { createSearchOnlyKey } from './utils/keys';
import { collectionSchema } from './utils/model';

export async function init() {
  await client.collections().create(collectionSchema);
  return await createSearchOnlyKey(collectionSchema.name);
}

if (require.main === module) {
  init().then((key) => {
    console.log('search-only api-key ::', key.value);
  });
}
