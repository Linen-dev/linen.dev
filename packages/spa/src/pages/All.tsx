import { useParams } from 'react-router-dom';
import AllView from '@linen/ui/AllView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { useUsersContext } from '@linen/contexts/Users';

type AllPageProps = {
  communityName: string;
};

export default function AllPage() {
  const { communityName } = useParams() as AllPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/all`);
  }, [communityName]);

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <AllView
      currentCommunity={inboxProps.currentCommunity}
      isSubDomainRouting={inboxProps.isSubDomainRouting}
      permissions={inboxProps.permissions}
      settings={inboxProps.settings}
      api={api}
      useUsersContext={useUsersContext}
    />
  );
}
