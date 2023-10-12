import { useSession } from '@linen/auth-client/client';
import { useLocation, useNavigate } from 'react-router-dom';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';
import { useLoading } from '@/components/Loading';
import { handleSignIn } from '@/utils/handleSignIn';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useSession();
  const navigate = useNavigate();
  let location = useLocation();
  const posthog = usePostHog();
  const [setLoading] = useLoading();

  useEffect(() => {
    if (auth.status === 'unauthenticated') {
      const url = new URL(window.location.href);
      const params = url.searchParams;
      const state = params.get('state');
      if (state) {
        handleSignIn(state);
      } else {
        return navigate('/signin', {
          state: { from: location },
          replace: true,
        });
      }
    }
    if (auth.status === 'authenticated') {
      auth.data?.user?.email && posthog?.identify(auth.data?.user?.email);
    }
    setLoading(auth.status === 'loading');

    return () => {
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status, setLoading]);

  return children;
}
