import useWebsockets from '.';
import { Permissions } from '@linen/types';
import { SerializedThread } from '@linen/types';

interface Props {
  communityId: string;
  token: string | null;
  permissions: Permissions;
  onNewMessage(payload: any): void;
}

function useFeedWebsockets({
  communityId,
  token,
  permissions,
  onNewMessage,
}: Props) {
  return useWebsockets({
    room: communityId && `room:${communityId}`,
    token,
    permissions,
    onNewMessage,
  });
}

export default useFeedWebsockets;
