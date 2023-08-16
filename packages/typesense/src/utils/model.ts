import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const collectionSchema: CollectionCreateSchema = {
  name: `threads`,
  fields: [
    {
      name: 'id',
      type: 'string',
    },
    {
      name: 'accountId',
      type: 'string',
    },
    {
      name: 'channel_name',
      type: 'string',
    },
    {
      name: 'mentions_name',
      type: 'string[]',
    },
    {
      name: 'author_name',
      type: 'string',
    },
    {
      name: 'body',
      type: 'string',
    },
    {
      name: 'is_public',
      type: 'bool',
    },
    {
      name: 'is_restrict',
      type: 'bool',
    },
    {
      name: 'last_reply_at',
      type: 'int64',
    },
    {
      name: 'accessible_to',
      type: 'string[]',
    },
  ],
  default_sorting_field: 'last_reply_at',
};
