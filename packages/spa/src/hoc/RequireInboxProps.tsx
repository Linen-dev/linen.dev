import { useParams } from 'react-router-dom';
import Loading from '@/components/Loading';
import { useLinenStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/fetcher';
import HandleError from '@/components/HandleError';

export default function RequireInboxProps({
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
    return HandleError(error);
  }

  return children;
}
