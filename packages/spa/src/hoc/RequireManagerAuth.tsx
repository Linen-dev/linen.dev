import { Navigate, useLocation, useParams } from 'react-router-dom';
import Loading from '@/components/Loading';
import { useLinenStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/fetcher';

export default function RequireManagerAuth({
  children,
}: {
  children: JSX.Element;
}) {
  const { communityName } = useParams() as { communityName: string };
  const setInboxProps = useLinenStore((state) => state.setInboxProps);
  const { isLoading, error } = useQuery({
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

  if (!communityName || isLoading) {
    return <Loading />;
  }

  if (error) {
    return <>An error has occurred: {JSON.stringify(error)}</>;
  }

  return <Wrapper children={children} />;
}

function Wrapper({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const permissions = useLinenStore((state) => state.permissions);

  if (!permissions) {
    return <Loading />;
  }
  if (!permissions.manage) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
