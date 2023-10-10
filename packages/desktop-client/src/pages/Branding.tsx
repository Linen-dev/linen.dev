import { useNavigate, useParams } from 'react-router-dom';
import BrandingView from '@linen/ui/BrandingView';
import { useLinenStore } from '@/store';
import { api } from '@/fetcher';
import { useEffect } from 'react';
import { localStorage } from '@linen/utilities/storage';
import InternalLink from '@/components/InternalLink';
import { mockAccount } from '@/mocks';

type BrandingPageProps = {
  communityName: string;
};

export default function BrandingPage() {
  const { communityName } = useParams() as BrandingPageProps;
  const { inboxProps, setCommunities, setCurrentCommunity } = useLinenStore(
    (state) => ({
      inboxProps: state.inboxProps,
      setCommunities: state.setCommunities,
      setCurrentCommunity: state.setCurrentCommunity,
    })
  );
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.set('pages_last', `/s/${communityName}/branding`);
  }, [communityName]);

  return (
    <BrandingView
      reload={() => navigate(0)}
      currentCommunity={inboxProps?.currentCommunity || mockAccount}
      setCurrentCommunity={setCurrentCommunity as any}
      api={api}
      setCommunities={setCommunities as any}
      InternalLink={InternalLink({ communityName })}
    />
  );
}
