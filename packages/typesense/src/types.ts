export type TypesenseThread = {
  id: string;
  increment_id: number;
  channel_name: string;
  mentions_name: string[];
  author_name: string;
  body: string;
  has_attachment: boolean;
  created_at: number;
  last_reply_at: number;
  thread: string;
};
