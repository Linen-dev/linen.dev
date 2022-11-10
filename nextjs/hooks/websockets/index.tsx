import { useState, useEffect } from 'react';
import { Channel, Socket } from 'phoenix';
import { Permissions } from 'types/shared';
import type { PushMessageType } from 'services/push';

interface Props {
  room?: string | null;
  token: string | null;
  permissions: Permissions;
  onNewMessage(payload: PushMessageType): void;
}

function useWebsockets({ room, token, permissions, onNewMessage }: Props) {
  const [channel, setChannel] = useState<Channel>();
  const [connected, setConnected] = useState<boolean>(false);
  useEffect(() => {
    if (permissions.chat && token && room) {
      //Set url instead of hard coding
      const socket = new Socket(
        `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/socket`,
        {
          params: { token },
          reconnectAfterMs: (_) => 10000,
          rejoinAfterMs: (_) => 10000,
          heartbeatIntervalMs: 10000,
        }
      );

      socket.connect();
      const channel = socket.channel(room);

      setChannel(channel);
      channel
        .join()
        .receive('ok', () => {
          setConnected(true);
        })
        .receive('error', () => {
          setConnected(false);
        });
      channel.on('new_msg', onNewMessage);

      return () => {
        setConnected(false);
        socket.disconnect();
      };
    }

    return () => {};
  }, []);

  useEffect(() => {
    channel?.off('new_msg');
    channel?.on('new_msg', onNewMessage);
  }, [onNewMessage]);

  return { connected, channel };
}

export default useWebsockets;
