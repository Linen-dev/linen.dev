import { baseLinen } from '@/config';
import { Navigate, useParams } from 'react-router-dom';
import Loading from '@/components/Loading';

export default function RedirectToLinen({ path }: { path: string }) {
  const { communityName } = useParams();

  if (!communityName) {
    return <Loading />;
  }

  return <Navigate to={`${baseLinen}/s/${communityName}${path}`} />;
}
