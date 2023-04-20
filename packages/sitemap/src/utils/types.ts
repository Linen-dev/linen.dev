export type AccountType = {
  id: string;
  customDomain: string | null;
  pathDomain: string;
  premium: boolean;
  channels: any[];
};
export type ChannelType = {
  id: string;
  channelName: string;
  pages: number | null;
  account: { id: string; customDomain: string | null; pathDomain: string };
};
export type UrlType = {
  url: string;
  lastmodISO: string;
  priority: number;
};
