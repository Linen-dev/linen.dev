import useWebsockets from './websockets';
import { Permissions } from '@linen/types';

interface Props {
  communityId: string;
  token: string | null;
  permissions: Permissions;
  onNewMessage(payload: any): void;
  onPresenceState?(state: any): void;
  onPresenceDiff?(state: any): void;
}

function useInboxWebsockets({
  communityId,
  token,
  permissions,
  onNewMessage,
  onPresenceDiff,
  onPresenceState,
}: Props) {
  return useWebsockets({
    room: communityId && `room:${communityId}`,
    token,
    permissions,
    onNewMessage,
    onPresenceDiff,
    onPresenceState,
  });
}

export default useInboxWebsockets;
