import { useNavigate, useParams } from 'react-router-dom';
import MembersView from '@linen/ui/MembersView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import { mockAccount } from '@/mocks';

type MembersPageProps = {
  communityName: string;
};

export default function MembersPage() {
  const { communityName } = useParams() as MembersPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/members`);
  }, [communityName]);

  return (
    <MembersView
      routerReload={() => navigate(0)}
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      api={api}
    />
  );
}
