import React, { useState, useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { channels, ThreadState } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';
import Header from './Header';
import Filters from './Filters';
import Grid from './Grid';
import debounce from 'awesome-debounce-promise';
import { FeedResponse } from './types';

interface Props {
  channels: channels[];
  communityName: string;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const debouncedFetch = debounce(
  ({ communityName, state }) => {
    return fetch(`/api/feed?communityName=${communityName}&state=${state}`, {
      method: 'GET',
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch the feed.');
    });
  },
  250,
  { leading: true }
);

const updateThread = (id: string, state: ThreadState) => {
  return fetch(`/api/threads/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      state,
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Failed to update the thread state.');
  });
};

const POLL_INTERVAL_IN_SECONDS = 30;
const POLL_INTERVAL = POLL_INTERVAL_IN_SECONDS * 1000;

export default function Feed({
  channels,
  communityName,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [feed, setFeed] = useState<FeedResponse>({ threads: [] });
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const fetchFeed = () =>
      debouncedFetch({ communityName, state })
        .then((data: FeedResponse) => {
          if (mounted) {
            setFeed(data);
          }
        })
        .catch(() => {
          if (mounted) {
            alert('Something went wrong. Please reload the page.');
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
  }, [communityName, state]);

  const onThreadUpdate = (id: string, threadState: ThreadState) => {
    return updateThread(id, threadState).then(() => {
      setFeed((data) => ({
        ...data,
        threads: data.threads.filter((thread) => thread.id !== id),
      }));
      debouncedFetch({ communityName, state }).then((data: FeedResponse) =>
        setFeed(data)
      );
    });
  };

  return (
    <PageLayout
      channels={channels}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
      className="block w-full"
    >
      <Header />
      <Filters
        state={state}
        onChange={(type: string, value: ThreadState) => {
          switch (type) {
            case 'state':
              setState(value);
          }
        }}
      />
      <Grid threads={feed.threads} loading={loading} onClose={onThreadUpdate} />
    </PageLayout>
  );
}
