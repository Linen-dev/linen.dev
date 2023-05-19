import { useNavigate, useParams } from 'react-router-dom';
import BrandingView from '@linen/ui/BrandingView';
import { useLinenStore } from '@/store';
import Loading from '@/components/Loading';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';

type BrandingPageProps = {
  communityName: string;
};

export default function BrandingPage() {
  const { communityName } = useParams() as BrandingPageProps;
  const inboxProps = useLinenStore((state) => state.inboxProps);
  const setCommunities = useLinenStore((state) => state.setCommunities);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/branding`);
  }, [communityName]);

  if (!inboxProps) {
    return <Loading />;
  }

  return (
    <BrandingView
      reload={() => navigate(0)}
      initialCommunity={inboxProps.currentCommunity}
      api={api}
      setCommunities={setCommunities as any}
    />
  );
}
