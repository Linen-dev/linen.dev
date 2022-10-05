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
          if (process.env.NODE_ENV === 'development') {
            console.log('Joined successfully', resp);
          }
        })
        .receive('error', (resp: any) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Unable to join', resp);
          }
        });
      channel.on('new_msg', onNewMessage);

      return () => {
        socket.disconnect();
      };
    }

    return () => {};
  }, []);

  return channel;
}

export default useWebsockets;
