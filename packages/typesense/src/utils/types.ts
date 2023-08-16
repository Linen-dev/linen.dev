export type TypesenseThread = {
  id: string;
  accountId: string;
  channel_name: string;
  mentions_name: string[];
  author_name?: string;
  body: string;
  is_public: boolean; // channel type
  is_restrict: boolean; // community type
  last_reply_at: number;
  accessible_to?: string[];
  thread: string;
};
