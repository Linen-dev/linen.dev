import React, { useState, useEffect, useRef } from 'react';
import PageLayout from 'components/layout/PageLayout';
import SidebarLayout from 'components/layout/shared/SidebarLayout';
import { channels, ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { Settings } from 'serializers/account/settings';
import { Permissions, Scope } from 'types/shared';
import Header from './Header';
import Filters from './Filters';
import Grid from './Grid';
import { FeedResponse, Selections } from './types';
import { Thread } from 'components/Thread';
import { NotifyMentions } from 'components/Notification';
import { scrollToBottom } from 'utilities/scroll';
import debounce from 'utilities/debounce';
import usePolling from 'hooks/polling';

interface Props {
  channels: channels[];
  communityName: string;
  currentUser: SerializedUser;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  token: string | null;
}

const debouncedFetch = debounce(
  ({ communityName, state, scope, page }: any) => {
    return fetch(
      `/api/feed?communityName=${communityName}&state=${state}&scope=${scope}&page=${page}`,
      {
        method: 'GET',
      }
    ).then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Failed to fetch the feed.');
    });
  }
);

export default function Feed({
  channels,
  communityName,
  currentUser,
  isSubDomainRouting,
  permissions,
  settings,
  token,
}: Props) {
  const [feed, setFeed] = useState<FeedResponse>({ threads: [], total: 0 });
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  const [scope, setScope] = useState<Scope>(Scope.All);
  const [page, setPage] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [thread, setThread] = useState<SerializedThread | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const updateThreads = async () => {
    const ids: string[] = [];
    for (const key in selections) {
      const selection = selections[key];
      if (selection) {
        ids.push(key);
      }
    }
    const newState =
      state === ThreadState.OPEN ? ThreadState.CLOSE : ThreadState.OPEN;
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/threads/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            state: newState,
          }),
        })
      )
    );
    setThread((thread) => {
      if (!thread) {
        return null;
      }
      if (ids.includes(thread.id)) {
        return {
          ...thread,
          state: newState,
        };
      }
      return thread;
    });

    setSelections({});
    setKey((key) => key + 1);
  };

  const [polling] = usePolling(
    {
      fetch() {
        return debouncedFetch({ communityName, state, scope, page });
      },
      success(data: FeedResponse) {
        setFeed(data);
      },
      error() {
        alert('Something went wrong. Please reload the page.');
      },
    },
    [communityName, state, page, scope, key]
  );

  return (
    <PageLayout
      channels={channels}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      settings={settings}
    >
      <NotifyMentions token={token} key="notifyMentions" />
      <SidebarLayout
        left={
          <>
            <Header />
            <Filters
              state={state}
              selections={selections}
              onChange={(type: string, value) => {
                setSelections({});
                setPage(1);
                switch (type) {
                  case 'state':
                    return setState(value as ThreadState);
                  case 'scope':
                    return setScope(value as Scope);
                }
              }}
              total={feed.total}
              onUpdate={updateThreads}
              page={page}
              onPageChange={(type: string) => {
                switch (type) {
                  case 'back':
                    return setPage((page) => page - 1);
                  case 'next':
                    return setPage((page) => page + 1);
                }
              }}
            />
            <Grid
              threads={feed.threads}
              loading={polling}
              selections={selections}
              onChange={(id: string, checked: boolean) => {
                setSelections((selections: Selections) => {
                  return {
                    ...selections,
                    [id]: checked,
                  };
                });
              }}
              onSelect={(thread: SerializedThread) => {
                setThread(thread);
              }}
            />
          </>
        }
        right={
          thread && (
            <Thread
              key={thread.id}
              id={thread.id}
              channelId={thread.channelId}
              channelName={thread.channel?.channelName as string}
              title={thread.title}
              state={thread.state}
              messages={thread.messages}
              viewCount={thread.viewCount}
              settings={settings}
              incrementId={thread.incrementId}
              isSubDomainRouting={isSubDomainRouting}
              slug={thread.slug}
              permissions={permissions}
              currentUser={currentUser}
              onThreadUpdate={({ state, title }) => {
                setThread((thread) => {
                  if (!thread) {
                    return null;
                  }
                  return {
                    ...thread,
                    state,
                    title,
                  };
                });
                setKey((key) => key + 1);
              }}
              onClose={() => setThread(null)}
              onSend={() => {
                scrollToBottom(ref.current as HTMLElement);
              }}
              onMount={() => {
                permissions.chat && scrollToBottom(ref.current as HTMLElement);
              }}
              token={token}
            />
          )
        }
        rightRef={ref}
      />
    </PageLayout>
  );
}
