import { useParams } from 'react-router-dom';
import InboxView from '@linen/ui/InboxView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { useUsersContext } from '@linen/contexts/Users';
import { mockAccount, mockSettings } from '@/mocks';

type InboxPageProps = {
  communityName: string;
};

export default function InboxPage() {
  const { communityName } = useParams() as InboxPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/inbox`);
  }, [communityName]);

  return (
    <InboxView
      channels={inboxProps?.channels || []}
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      dms={inboxProps?.dms || []}
      isSubDomainRouting={false}
      permissions={inboxProps?.permissions || ({} as any)}
      settings={inboxProps?.settings || mockSettings}
      api={api}
      useUsersContext={useUsersContext}
    />
  );
}
