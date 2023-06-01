import { useParams } from 'react-router-dom';
import AllView from '@linen/ui/AllView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { useUsersContext } from '@linen/contexts/Users';
import { mockAccount, mockSettings } from '@/mocks';

type AllPageProps = {
  communityName: string;
};

export default function AllPage() {
  const { communityName } = useParams() as AllPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/all`);
  }, [communityName]);

  return (
    <AllView
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      isSubDomainRouting={false}
      permissions={inboxProps?.permissions || ({} as any)}
      settings={inboxProps?.settings || mockSettings}
      api={api}
      useUsersContext={useUsersContext}
    />
  );
}
