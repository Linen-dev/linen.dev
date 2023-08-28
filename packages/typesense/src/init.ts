import { client } from './utils/client';
import { createSearchOnlyKey } from './utils/keys';
import { collectionSchema } from './utils/model';

export async function init() {
  try {
    await client.collections().create(collectionSchema);
  } catch (error: any) {
    if (error.name === 'ObjectAlreadyExists' || error.httpStatus === 409) {
      console.error({ error: JSON.stringify(error) });
    } else {
      throw error;
    }
  }
  return await createSearchOnlyKey(collectionSchema.name);
}

if (require.main === module) {
  init().then((key) => {
    console.log('search-only api-key ::', key.value);
  });
}
