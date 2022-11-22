import useWebsockets from '.';
import { Permissions } from '@linen/types';
import { SerializedMessage } from '@linen/types';

interface Props {
  id?: string;
  token: string | null;
  permissions: Permissions;
  onMessage(
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ): void;
}

function useThreadWebsockets({ id, token, permissions, onMessage }: Props) {
  return useWebsockets({
    room: id && `room:topic:${id}`,
    token,
    permissions,
    onNewMessage(payload) {
      const currentThreadId = id;
      try {
        if (payload.is_reply && payload.thread_id === currentThreadId) {
          const messageId = payload.message_id;
          const imitationId = payload.imitation_id;
          const message: SerializedMessage =
            payload.message && JSON.parse(payload.message);
          if (!message) {
            return;
          }
          onMessage(message, messageId, imitationId);
        }
      } catch (exception) {
        if (process.env.NODE_ENV === 'development') {
          console.log(exception);
        }
      }
    },
  });
}

export default useThreadWebsockets;
