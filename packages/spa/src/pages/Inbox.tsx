import { useParams } from 'react-router-dom';
import InboxView from '@linen/ui/InboxView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

type InboxPageProps = {
  communityName: string;
};

export default function InboxPage() {
  const { communityName } = useParams() as InboxPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/inbox`);
  }, [communityName]);

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <InboxView
      channels={inboxProps.channels}
      currentCommunity={inboxProps.currentCommunity}
      dms={inboxProps.dms}
      isSubDomainRouting={inboxProps.isSubDomainRouting}
      permissions={inboxProps.permissions}
      settings={inboxProps.settings}
      api={api}
    />
  );
}
