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
