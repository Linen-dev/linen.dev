import { Block } from './Block';

export interface Pagination {
  total_count: number;
  page: number;
  per_page: number;
  page_count: number;
  first: number;
  last: number;
}

export interface Paging {
  count: number;
  total: number;
  page: number;
  pages: number;
}

export interface Channel {
  id: string;
  is_channel: boolean;
  is_group: boolean;
  is_im: boolean;
  name: string;
  is_shared: boolean;
  is_org_shared: boolean;
  is_ext_shared: boolean;
  is_private: boolean;
  is_mpim: boolean;
  pending_shared: any[];
  is_pending_ext_shared: boolean;
  user: string;
}

export interface Style {
  bold: boolean;
}

export interface Style2 {
  bold: boolean;
  code?: boolean;
}

export interface Element3 {
  type: string;
  text: string;
  url: string;
  style: Style2;
  name: string;
  user_id: string;
  channel_id: string;
}

export interface Element2 {
  type: string;
  user_id: string;
  text: string;
  range: string;
  style: Style;
  name: string;
  elements: Element3[];
  url: string;
}

export interface Text {
  type: string;
  text: string;
  emoji: boolean;
}

export interface File {
  id: string;
  created: number;
  timestamp: number;
  name: string;
  title: string;
  mimetype: string;
  filetype: string;
  pretty_type: string;
  user: string;
  editable: boolean;
  size: number;
  mode: string;
  is_external: boolean;
  external_type: string;
  is_public: boolean;
  public_url_shared: boolean;
  display_as_bot: boolean;
  username: string;
  url_private: string;
  url_private_download: string;
  media_display_type: string;
  permalink: string;
  permalink_public: string;
  comments_count: number;
  is_starred: boolean;
  has_rich_preview: boolean;
}

export interface Field2 {
  title: string;
  value: string;
  short: boolean;
}

export interface Attachment {
  text: string;
  title: string;
  footer: string;
  id: number;
  footer_icon: string;
  ts: number;
  color: string;
  fields: Field2[];
  mrkdwn_in: string[];
  fallback: string;
  image_url: string;
  image_width?: number;
  image_height?: number;
  image_bytes?: number;
  pretext: string;
}

export interface Match {
  iid: string;
  team: string;
  score: number;
  channel: Channel;
  type: string;
  user: string;
  username: string;
  ts: string;
  blocks: Block[];
  text: string;
  permalink: string;
  no_reactions: boolean;
  files: File[];
  attachments: Attachment[];
}

export interface Messages {
  total: number;
  pagination: Pagination;
  paging: Paging;
  matches: Match[];
}

export interface SlackSearchResponseBody {
  ok: boolean;
  query: string;
  messages: Messages;
}
// }
