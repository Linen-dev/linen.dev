import { useEffect, useState } from 'react';

interface Props {
  fetch(): Promise<void>;
  success(data: any): void;
  error(): void;
}

const POLL_INTERVAL_IN_SECONDS = 30;
const POLL_INTERVAL = POLL_INTERVAL_IN_SECONDS * 1000;

function usePolling({ fetch, success, error }: Props, dependencies?: any[]) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetchFeed = () =>
      fetch()
        .then((data: any) => {
          if (mounted) {
            success(data);
          }
        })
        .catch(() => {
          if (mounted) {
            error();
          }
        })
        .finally(() => {
          if (mounted) {
            setLoading(false);
          }
        });
    fetchFeed();

    const intervalId = setInterval(() => {
      fetchFeed();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      mounted = false;
    };
  }, dependencies || []);

  return [loading];
}

export default usePolling;
