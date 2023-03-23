export type SerializedChannel = {
  id: string;
  channelName: string;
  default: boolean;
  hidden: boolean;
  accountId: string | null;
  pages: number | null;
  stats?: string;
  type?: 'DM' | 'PUBLIC' | 'PRIVATE' | null;
};

export enum channelsIntegrationType {
  'GITHUB' = 'GITHUB',
  'EMAIL' = 'EMAIL',
  'LINEAR' = 'LINEAR',
}
