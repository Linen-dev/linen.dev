### Pagination (road map to cursor based)

We currently support offset pagination, that means we count all results to determine the total number of pages, the server response is similar to:

```json
{
  "data": [
    /*...*/
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 5
  }
}
```

#### Cursor-based

Cursor-based pagination works by returning a pointer to a specific item in the dataset. Similar to:

```json
{
  "data": [
    /*...*/
  ],
  "next_cursor": "random123"
}
```

This will scale well for large datasets, we don't need to count all results.

Trade offs:

- The cursor must be based on a unique, sequential column (or columns) in the source table.
- There is no concept of the total number of pages or results in the set.
- The client can’t jump to a specific page.

#### Next Cursor

There two common ways to define the next cursor:

- Option 1, we set the limit to count plus one, to fetch one more result than the count specified by the client. The extra result isn’t returned in the result set, but we use the ID of the value as the next_cursor. If empty, we can assume that there is no more data. Our query should filter by `id <= next_cursor` (equal or less)

- Option 2, we return the oldest id from the result set as the next_cursor. Since we don't know if there is more data, the client will need to call for more data even if it may return empty. Our query should filter by `id < next_cursor` (less)

#### Current data model

```git
model messages {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  body      String
  sentAt    DateTime
  ...
  @@index([threadId])
}
```

Since we always query by threadId, it should be part of our key. And since all messages have sentAt as timestamp field, we could use it as our next_cursor.

We need to change the data type to long or serial, and create a index with both threadId and sentAt fields.

#### Client-side

Requests from client-side should be:

1. initial request, POST `api/messages?limit=50` body: `{ channelId: "channelId", communityName: "communityName" }` that should return: `{ next_cursor: "random", messages: [{ /*message object*/ }, { ...49 more }] }`

2. When user scrolls up, the next call should be POST `api/messages?limit=50&cursor=random` body: `{ channelId: "channelId", communityName: "communityName" }` that should return: `{ next_cursor: "random", messages: [{ /*message object*/ }, { ...49 more }] }`

The server should return an empty cursor if there are no more results, for instance: `{ next_cursor: "", ...rest }`, we should be sure to avoid call the server with empty cursor, otherwise it could understand as initial request (first page).

#### New data model proposal

```git
model messages {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  body      String
-  sentAt    DateTime
+  sentAt    Int
  ...
  @@index([threadId])
+ @@index([threadId, sentAt])
}
```

#### Server-side

Requests that support this new pagination will take two new fields:

- cursor: an string value
- limit: a maximum number of items you want returned for the page

Responses will include a new field:

- next_cursor: an string value, or an empty string if there are no more results

#### Encoded Cursors

We’re using Base64 to encode information on how to retrieve the next set of results within the cursor. This allows us to technically implement different underlying pagination schemes per endpoint, while giving a consistent interface to consumers of the API.

#### Sitemaps

We could reverse the cursor by sorts the records in ascending order, using the first result as cursor. For instance:

Change from `linen.community.dev/c/general/1` to `linen.community.dev/c/general/YXNj`

Since is the first page, we encode just the asc word `btoa('asc')` to let the client-side or SSR know that it should serve results in ascending order. This will ensure that our sitemap links keep the same with the community grown, it will be incremental.

For the end-user we could even allow it to get a direct link the a message just creating a base64 from the sort and the message timestamp.

```js
btoa('asc:1658883683710');
// outputs: YXNjOjE2NTg4ODM2ODM3MTA=
```

Same for all pages, change from `linen.community.dev/c/general/2` to `linen.community.dev/c/general/YXNjOjE2NTg4ODM2ODM3MTA=`

#### Threads or messages? or Both?

Both, every message from a channel should be a thread on linen. With this in mind we should implement this pagination in our threads model.

We could have use incrementId as key but our synchronization process couldn't guarantee the insertion in the correct order. We will need a field sentAt in our thread model.

```git
model threads {
  id               String   @id @default(uuid())
  ...
  channelId String
+ sentAt           Int
  ...
  @@index([channelId])
+ @@index([channelId, sentAt])
}
```

Since we always query by channelId, it should be part of our key. And since all thread will have a sentAt as timestamp field, we could use it as our next_cursor.
