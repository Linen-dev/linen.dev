import { useSession } from '@linen/auth/client';
import { Navigate, useLocation } from 'react-router-dom';
import Loading from '@/components/Loading';

export default function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useSession();
  let location = useLocation();

  if (auth.status === 'loading') {
    return <Loading />;
  }
  if (auth.status === 'unauthenticated') {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
