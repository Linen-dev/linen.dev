import useWebsockets from './websockets';
import { Permissions } from '@linen/types';

interface Props {
  communityId: string;
  token: string | null;
  permissions: Permissions;
  onPresenceState?(state: any): void;
  onPresenceDiff?(state: any): void;
}

function usePresenceWebsockets({
  communityId,
  token,
  permissions,
  onPresenceDiff,
  onPresenceState,
}: Props) {
  return useWebsockets({
    room: communityId && `room:${communityId}`,
    token,
    permissions,
    onPresenceDiff,
    onPresenceState,
  });
}

export default usePresenceWebsockets;
