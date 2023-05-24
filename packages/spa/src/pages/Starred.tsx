import { useParams } from 'react-router-dom';
import StarredView from '@linen/ui/StarredView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { useUsersContext } from '@linen/contexts/Users';

type StarredPageProps = {
  communityName: string;
};

export default function StarredPage() {
  const { communityName } = useParams() as StarredPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/starred`);
  }, [communityName]);

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <StarredView
      currentCommunity={inboxProps.currentCommunity}
      isSubDomainRouting={inboxProps.isSubDomainRouting}
      permissions={inboxProps.permissions}
      settings={inboxProps.settings}
      api={api}
      useUsersContext={useUsersContext}
    />
  );
}
