export type SyncJobType = {
  account_id: string;
  file_location?: string;
  fullSync?: boolean;
};

export type TwoWaySyncEvent =
  | 'newMessage'
  | 'newThread'
  | 'threadReopened'
  | 'threadClosed'
  | 'threadUpdated';

export type TwoWaySyncType = {
  event: TwoWaySyncEvent;
  id: string;
  channelId?: string;
  threadId?: string;
  messageId?: string;
};
