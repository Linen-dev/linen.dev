import { post } from 'utilities/requests';
import debounce from '@linen/utilities/debounce';

export const postReaction = debounce(
  (params: {
    communityId: string;
    messageId: string;
    type: string;
    action: string;
  }) => {
    return post('/api/reactions', params);
  }
);

export const mergeThreadsRequest = debounce(
  (params: { from: string; to: string }) => {
    return post('/api/merge', params);
  }
);

export const moveMessageToThreadRequest = debounce(
  (params: { messageId: string; threadId: string }) => {
    return post('/api/move/message/thread', params);
  }
);

export const moveMessageToChannelRequest = debounce(
  (params: { messageId: string; threadId: string }) => {
    return post('/api/move/message/channel', params);
  }
);

export const moveThreadToChannelRequest = debounce(
  (params: { threadId: string; channelId: string }) => {
    return post('/api/move/thread/channel', params);
  }
);
