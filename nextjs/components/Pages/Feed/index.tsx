import React, { useState, useEffect } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { channels, ThreadState } from '@prisma/client';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';
import Header from './Header';
import Filters from './Filters';
import Grid from './Grid';
import { SerializedThread } from 'serializers/thread';
import debounce from 'awesome-debounce-promise';

interface Props {
  channels: channels[];
  communityName: string;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

interface FeedResponse {
  threads: SerializedThread[];
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
        loading={loading}
        onChange={(type: string, value: ThreadState) => {
          switch (type) {
            case 'state':
              setState(value);
          }
        }}
      />
      <Grid threads={feed.threads} loading={loading} />
    </PageLayout>
  );
}
