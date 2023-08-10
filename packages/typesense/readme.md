# typesense search

## setup (public communities)

setup.ts will:

- create a collection for the community
- create a search-only api key
- persist search settings on our main database

## search settings

```ts
type settings = {
  engine: 'typesense';
  scope: 'public' | 'private'; // if private, apiKey must be generated dynamically after validate user token
  apiKey?: string; // exist only for public scope
  indexName: string; // each community will have their own collection
  apiKeyId?: number;
  apiKeyExpiresAt?: number;
  lastSync?: number; // cursor used to sync after initial dump
};
```

## initial dump

dump.ts will:

- query for all public threads from public channels from a specific community
- serialize each one and insert it to typesense datastore
- at end it will persist the flag "lastSync" into search settings

## incremental sync

sync.ts will:

- get "lastSync" from search settings
- query for all threads that have been updated or created after the cursor
- serialize each one and upsert it to typesense datastore
- at end it will persist the flag "lastSync" into search settings

> sync will be a job in our queue system that runs every N (TBD)

## apiKey for private

TODO

## Pending

- [] client: open thread on same page
- [] client: search router query parameters
- [] server: apiKey private handle
- [] server: expose setup, dump and sync functions
- [] server: queue tasks
