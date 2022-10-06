import { useState, useEffect } from 'react';
import { Channel, Socket } from 'phoenix';
import { Permissions } from 'types/shared';
import type { PushMessageType } from 'services/push';

interface Props {
  room?: string;
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
        { params: { token } }
      );

      socket.connect();
      const channel = socket.channel(room);

      setChannel(channel);
      channel
        .join()
        .receive('ok', (resp: any) => {
          setConnected(true);
        })
        .receive('error', (resp: any) => {
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

  return { connected, channel };
}

export default useWebsockets;
