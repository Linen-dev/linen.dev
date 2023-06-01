import { useSession } from '@linen/auth/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useLoading } from '@/components/Loading';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useSession();
  const navigate = useNavigate();
  let location = useLocation();
  const posthog = usePostHog();
  const [setLoading] = useLoading();

  useEffect(() => {
    setLoading(auth.status === 'loading');
    if (auth.status === 'unauthenticated') {
      return navigate('/signin', { state: { from: location }, replace: true });
    }
    if (auth.status === 'authenticated') {
      auth.data?.user?.email && posthog?.identify(auth.data?.user?.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, setLoading]);

  return children;
}
