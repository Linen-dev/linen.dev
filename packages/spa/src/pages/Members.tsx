import { useNavigate, useParams } from 'react-router-dom';
import MembersView from '@linen/ui/MembersView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

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

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <MembersView
      routerReload={() => navigate(0)}
      currentCommunity={inboxProps.currentCommunity}
      api={api}
    />
  );
}
