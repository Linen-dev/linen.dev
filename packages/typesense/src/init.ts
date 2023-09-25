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
      if (error.message === 'connect ECONNREFUSED 127.0.0.1:8108') {
        console.log('-----------------------');
        console.log(
          'Please ensure that you have a typesense server running at port 8108'
        );
        console.log(
          'Step 1. Find out how to install typesense locally from their docs.'
        );
        console.log(
          'Step 2. Then run the following command, choose your own data dir.'
        );
        console.log(
          './typesense-server --data-dir=/MyDataDir --api-key=xyz --api-port=8108'
        );
        console.log('-----------------------');
      }
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
