import { useEffect } from 'react';
import { Socket } from 'phoenix';

export const NotificationProvider = ({
  token,
  topic,
  onNewMessage,
}: {
  token: string;
  topic: string;
  onNewMessage: (...args: any) => void;
}) => {
  const onJoinSuccessful = (res: any) => {};
  const onJoinError = (res: any) => {};

  useEffect(() => {
    const socket = new Socket(
      `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/socket`,
      { params: { token } }
    );
    socket.connect();

    const channel = socket.channel(topic);
    channel
      .join()
      .receive('ok', onJoinSuccessful)
      .receive('error', onJoinError);
    channel.on('new_msg', onNewMessage);

    return () => {
      socket.disconnect();
    };
  }, []);

  return <></>;
};
