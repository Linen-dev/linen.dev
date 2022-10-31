import { post } from 'utilities/http';
import debounce from 'utilities/debounce';

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

export const postMerge = debounce((params: { from: string; to: string }) => {
  return post('/api/merge', params);
});

export const moveMessage = debounce(
  (params: { messageId: string; threadId: string }) => {
    return post('/api/move/message', params);
  }
);
