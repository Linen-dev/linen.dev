export type FindThreadsByCursorType = {
  sentAt?: string;
  direction?: 'lt' | 'gt' | 'gte';
  sort?: 'desc' | 'asc';
};
