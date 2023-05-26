import { useSession } from '@linen/auth/client';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '@/components/Loading';
import { usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useSession();
  let location = useLocation();
  const posthog = usePostHog();

  useEffect(() => {
    if (auth.data?.user?.email) {
      posthog?.identify(auth.data.user.email);
    }
  }, [posthog, auth.data?.user?.email]);

  if (auth.status === 'loading') {
    return <Loading />;
  }
  if (auth.status === 'unauthenticated') {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
