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

interface InboxResponse {
  threads: SerializedThread[];
}

const fetchInbox = debounce(
  ({ communityName, state }) => {
    return fetch(`/api/inbox?communityName=${communityName}&state=${state}`, {
      method: 'GET',
    }).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch the inbox.');
    });
  },
  250,
  { leading: true }
);

export default function Inbox({
  channels,
  communityName,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [inbox, setInbox] = useState<InboxResponse>({ threads: [] });
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchInbox({ communityName, state })
      .then((data: InboxResponse) => {
        if (mounted) {
          setInbox(data);
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
    return () => {
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
      <Grid threads={inbox.threads} loading={loading} />
    </PageLayout>
  );
}
