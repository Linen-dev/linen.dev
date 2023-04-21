import useWebsockets from './websockets';
import { Permissions } from '@linen/types';

interface Props {
  communityId: string;
  token: string | null;
  permissions: Permissions;
  onNewMessage(payload: any): void;
}

function useInboxWebsockets({
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

export default useInboxWebsockets;
