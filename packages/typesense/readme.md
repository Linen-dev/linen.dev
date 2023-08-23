# typesense search

## access control

we use scoped api-key to control access. scoped api-key are api-key with hardcoded filter on it that is not possible to override.

our model has these filter for access control:

is_restrict: boolean; // community related, if community=private it will be true, otherwise false
is_public: boolean; // channel related, if channel=public it will be true, otherwise false

public communities will have a scoped api-key for anonymous search: `accountId:=${accountId} && is_public:=true`.
private communities will not have api-key for anonymous search, search will relay on user-search-settings

authed users will have a scoped api-key for searching, it will allow user search between public content and private content that the user has access to: `accountId:=${accountId} && (is_public:=true || accessible_to:=${userId})`

our feed search will use a scoped api-key where allow to anonymous search between public communities and public channels: `is_restrict:=false && is_public:=true`.

## init

> run once

init.ts will:

- create single collection
- create search-only api-key (this api-key is the base for all scoped api-key we will create later)

## setup (public communities)

setup.ts will:

- create a scoped api-key for anonymous search
- persist search settings on our main database
- create a scoped api-key for users
- persist user search settings on our main database

## search settings

```ts
type settings = {
  engine: 'typesense';
  scope: 'public' | 'private'; // if private, user settings must be used
  apiKey: string | 'private'; // exist only for public scope
  apiKeyExpiresAt?: number;
  lastSync?: number; // cursor used to sync after initial dump
};
```

## initial dump

dump.ts will:

- query for all threads from a specific community
- serialize and insert it to typesense datastore
- at end it will persist the flag "lastSync" into search settings

## incremental sync

sync.ts will:

- get "lastSync" from search settings
- query for all messages that have been updated or created after the cursor
- serialize and upsert it to typesense datastore
- at end it will persist the flag "lastSync" into search settings

> sync will be a job in our queue system that runs every TBD

## setup (private communities)

same steps as public communities except it will not create a scoped api-key for anonymous search.

## Pending

- [x] client: open thread on same page
- [x] client: search router query parameters
- [x] server: api-key private handle
- [x] server: queue tasks
- [x] server: expose setup, dump and sync functions
- [x] server: api-key refresh task
- [x] server: channel visibility change
- [x] server: community visibility change
- [x] server: user name changes
- [x] server: channel name changes
- [x] server: setup sync all cron job
- [x] server: new community event for setup
- [x] server: setup create dump task
- [] client: search on feed
- [] server: channel hidden changes (is_public:=false || accessible_to:=nothing)
- [] server: channel membership changes
