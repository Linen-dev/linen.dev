import { useParams } from 'react-router-dom';
import StarredView from '@linen/ui/StarredView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { useUsersContext } from '@linen/contexts/Users';
import { mockAccount, mockSettings } from '@/mocks';

type StarredPageProps = {
  communityName: string;
};

export default function StarredPage() {
  const { communityName } = useParams() as StarredPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/starred`);
  }, [communityName]);

  return (
    <StarredView
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      isSubDomainRouting={false}
      permissions={inboxProps?.permissions || ({} as any)}
      settings={inboxProps?.settings || mockSettings}
      api={api}
      useUsersContext={useUsersContext}
    />
  );
}
