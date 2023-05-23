import { Navigate, useLocation, useParams } from 'react-router-dom';
import Loading from '@/components/Loading';
import { useLinenStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/fetcher';
import HandleError from '@/components/HandleError';

export default function RequireManagerAuth({
  children,
}: {
  children: JSX.Element;
}) {
  const location = useLocation();
  const { communityName } = useParams() as { communityName: string };
  const setInboxProps = useLinenStore((state) => state.setInboxProps);
  const { isLoading, error, data } = useQuery({
    queryKey: ['inbox', { communityName }],
    queryFn: () =>
      api.getInboxProps({ communityName }).then((data) => {
        setInboxProps(data, communityName);
        return data;
      }),
    enabled: !!communityName,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (!communityName || isLoading || !data) {
    return <Loading />;
  }

  if (error) {
    return HandleError(error);
  }

  if (!data.permissions.manage) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
