import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';

export const collectionFactory = (
  accountId: string
): CollectionCreateSchema => ({
  name: `threads_${accountId}`,
  fields: [
    {
      name: 'id',
      type: 'string',
    },
    {
      name: 'increment_id',
      type: 'int64',
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
      name: 'has_attachment',
      type: 'bool',
    },
    {
      name: 'created_at',
      type: 'int64',
    },
    {
      name: 'last_reply_at',
      type: 'int64',
    },
  ],
  default_sorting_field: 'last_reply_at',
  enable_nested_fields: true,
});
