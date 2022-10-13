import { useState, useRef, useCallback } from 'react';
import SidebarLayout from 'components/layout/shared/SidebarLayout';
import { ThreadState } from '@prisma/client';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { Settings } from 'serializers/account/settings';
import { Permissions, Scope } from 'types/shared';
import Header from '../Header';
import Filters from '../Filters';
import Grid from '../Grid';
import { FeedResponse, Selections } from '../types';
import { Thread } from 'components/Thread';
import { scrollToBottom } from 'utilities/scroll';
import debounce from 'utilities/debounce';
import { sendMessageWrapper } from './sendMessageWrapper';
import usePolling from 'hooks/polling';
import useThreadWebsockets from 'hooks/websockets/thread';
import { useUsersContext } from 'contexts/Users';
import { useJoinContext } from 'contexts/Join';
import useFeedWebsockets from 'hooks/websockets/feed';
import type { CommunityPushType } from 'services/push';
import { toast } from 'components/Toast';

interface Props {
  communityId: string;
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
  communityId,
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
  const [thread, setThread] = useState<SerializedThread>();
  const ref = useRef<HTMLDivElement>(null);
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();

  useThreadWebsockets({
    id: thread?.id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      setThread((thread) => {
        if (!thread) {
          return;
        }
        return {
          ...thread,
          messages: [
            ...thread.messages.filter(
              ({ id }: any) => id !== imitationId && id !== messageId
            ),
            message,
          ],
        };
      });
    },
  });

  const onNewMessage = useCallback(
    (payload: CommunityPushType) => {
      const threadId = payload.thread_id;
      fetch('/api/threads/' + threadId)
        .then((response) => response.json())
        .then((thread: SerializedThread) => {
          if (
            scope === Scope.Participant &&
            !thread.messages.find(
              (m) =>
                m.author?.id === currentUser.id ||
                m.mentions.find((me) => me.id === currentUser.id)
            )
          ) {
            return;
          }
          setFeed((feed) => {
            if (page > 1) {
              return feed;
            }
            const { threads, ...rest } = feed;
            return {
              ...rest,
              threads: [thread, ...threads.filter((t) => t.id !== thread.id)],
            };
          });
        });
    },
    [currentUser?.id, scope]
  );

  useFeedWebsockets({
    communityId,
    onNewMessage,
    permissions,
    token,
  });

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
        return;
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
        toast.error('Something went wrong. Please reload the page.');
      },
    },
    [communityName, state, page, scope, key]
  );

  const updateThread = ({
    state,
    title,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    if (!thread) {
      return;
    }
    const options: { state?: ThreadState; title?: string } = {};

    if (state) {
      options.state = state;
    }

    if (title) {
      options.title = title;
    }

    setThread((thread) => {
      if (!thread) {
        return;
      }
      return {
        ...thread,
        ...options,
      };
    });

    setFeed((feed) => {
      return {
        ...feed,
        threads: feed.threads.map((feedThread) => {
          if (feedThread.id === thread.id) {
            return {
              ...feedThread,
              ...options,
            };
          }
          return feedThread;
        }),
      };
    });

    return fetch(`/api/threads/${thread.id}`, {
      method: 'PUT',
      body: JSON.stringify(options),
    })
      .then((response) => {
        if (response.ok) {
          if (options.state) {
            setKey((key) => key + 1);
          }
          return;
        }
        throw new Error('Failed to close the thread.');
      })
      .catch((exception) => {
        toast.error(exception.message);
      });
  };

  const sendMessage = sendMessageWrapper({
    currentUser,
    allUsers,
    setThread,
    setFeed,
    communityId,
    startSignUp,
  });

  return (
    <>
      <SidebarLayout
        left={
          <>
            <Header />
            <Filters
              state={state}
              selections={selections}
              defaultScope={scope}
              permissions={permissions}
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
              updateThread={updateThread}
              onClose={() => setThread(undefined)}
              sendMessage={sendMessage}
              onSend={() => {
                scrollToBottom(ref.current as HTMLElement);
              }}
              onMount={() => {
                permissions.chat && scrollToBottom(ref.current as HTMLElement);
              }}
            />
          )
        }
        rightRef={ref}
      />
    </>
  );
}
