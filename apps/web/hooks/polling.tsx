import { useEffect, useState } from 'react';

interface Props {
  fetch(): Promise<void>;
  success(data: any): void;
  error(): void;
}

const POLL_INTERVAL_IN_SECONDS = 999999;
const POLL_INTERVAL = POLL_INTERVAL_IN_SECONDS * 1000;

function usePolling({ fetch, success, error }: Props, dependencies?: any[]) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetchInbox = () =>
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
    fetchInbox();

    const intervalId = setInterval(() => {
      fetchInbox();
    }, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      mounted = false;
    };
  }, dependencies || []);

  return [loading];
}

export default usePolling;
