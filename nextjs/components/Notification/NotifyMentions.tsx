import { toast } from 'components/Toast';
import { useSession } from 'next-auth/react';
import { NotificationProvider } from './NotificationProvider';

export const NotifyMentions = ({ token }: { token: string | null }) => {
  const { data, status } = useSession();

  const onNewMessage = (payload: any) => {
    // TODO: under construction
    toast.info(JSON.stringify(payload, null, 2));
  };

  if (status !== 'authenticated') {
    return <></>;
  }

  if (!token) {
    return <></>;
  }

  return (
    <NotificationProvider
      onNewMessage={onNewMessage}
      token={token}
      topic={`user:${(data?.user as any).id}`}
      key="notifyMentions"
    />
  );
};
