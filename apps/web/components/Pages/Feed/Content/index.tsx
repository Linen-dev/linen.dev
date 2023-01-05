import { useState, useRef, useCallback } from 'react';
import { Layouts, Pages, Toast } from '@linen/ui';
import Thread from 'components/Thread';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import usePolling from '@linen/hooks/polling';
import useKeyboard from '@linen/hooks/keyboard';
import { useUsersContext } from '@linen/contexts/Users';
import { useJoinContext } from 'contexts/Join';
import useFeedWebsockets from '@linen/hooks/websockets/feed';
import type { CommunityPushType } from 'services/push';
import { manageSelections } from './utilities/selection';
import {
  SerializedMessage,
  SerializedThread,
  Settings,
  ThreadState,
  Permissions,
  Scope,
} from '@linen/types';
import { addMessageToThread, filterByScope, prependThread } from './state';

const { Header, Filters, Grid } = Pages.Feed;
const { SidebarLayout } = Layouts.Shared;

interface FeedResponse {
  threads: SerializedThread[];
  total: number;
}

interface Selections {
  [key: string]: {
    checked: boolean;
    index: number;
  };
}

interface Props {
  fetchFeed({
    communityName,
    state,
    scope,
    page,
  }: {
    communityName: string;
    state: ThreadState;
    scope: Scope;
    page: number;
  }): Promise<FeedResponse>;
  fetchThread(threadId: string): Promise<SerializedThread>;
  putThread(
    threadId: string,
    options: {
      state?: ThreadState | undefined;
      title?: string | undefined;
    }
  ): Promise<SerializedThread>;
  fetchTotal({
    communityName,
    state,
    scope,
  }: {
    communityName: string;
    state: ThreadState;
    scope: Scope;
  }): Promise<FeedResponse>;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

export default function Feed({
  fetchFeed,
  fetchThread,
  putThread,
  fetchTotal,
  isSubDomainRouting,
  permissions,
  settings,
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
  const { isShiftPressed } = useKeyboard();

  const token = permissions.token || null;
  const currentUser = permissions.user || null;
  const { communityId, communityName } = settings;

  const onNewMessage = useCallback(
    (payload: CommunityPushType) => {
      const thread: SerializedThread =
        payload.thread && JSON.parse(payload.thread);
      const message: SerializedMessage =
        payload.message && JSON.parse(payload.message);
      if (page > 1) {
        return;
      }
      if (thread) {
        if (filterByScope(scope, thread.messages, currentUser)) {
          return;
        }
        setFeed(prependThread(thread));
      }
      if (message) {
        if (filterByScope(scope, [message], currentUser)) {
          return;
        }
        const thread = feed.threads.find((t) => t.id === message.threadId);
        if (thread) {
          setFeed(prependThread(thread, message));
        } else {
          fetchThread(payload.thread_id).then((thread) =>
            setFeed(prependThread(thread, message))
          );
        }
      }
    },
    [currentUser?.id, scope]
  );

  const onThreadMessage = (
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) => {
    setThread((thread) =>
      addMessageToThread(thread, message, messageId, imitationId)
    );
  };

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
      if (selection?.checked) {
        ids.push(key);
      }
    }
    const newState =
      state === ThreadState.OPEN ? ThreadState.CLOSE : ThreadState.OPEN;
    await Promise.all(ids.map((id) => putThread(id, { state: newState })));
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
      fetch(): any {
        return fetchFeed({ communityName, state, scope, page });
      },
      success(data: FeedResponse) {
        setFeed((f) => ({ ...f, threads: data.threads }));
      },
      error() {
        Toast.error('Something went wrong. Please reload the page.');
      },
    },
    [communityName, state, page, scope, key]
  );

  const [totalPolling] = usePolling(
    {
      fetch(): any {
        return fetchTotal({ communityName, state, scope });
      },
      success(data: FeedResponse) {
        setFeed((f) => ({ ...f, total: data.total }));
      },
      error() {},
    },
    [communityName, state, scope]
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

    return putThread(thread.id, options)
      .then((_) => {
        if (options.state) {
          setKey((key) => key + 1);
        }
        return;
      })
      .catch((_: Error) => {
        Toast.error('Failed to close the thread.');
      });
  };

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
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
              onChange={(type: string, value: ThreadState | Scope) => {
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
              isFetchingTotal={totalPolling}
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
              permissions={permissions}
              onChange={(id: string, checked: boolean, index: number) => {
                setSelections((selections: Selections) => {
                  return manageSelections({
                    id,
                    checked,
                    index,
                    selections,
                    ids: feed.threads.map((thread) => thread.id),
                    isShiftPressed,
                  });
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
              thread={thread}
              key={thread.id}
              channelId={thread.channelId}
              channelName={thread.channel?.channelName as string}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              permissions={permissions}
              currentUser={currentUser}
              updateThread={updateThread}
              onClose={() => setThread(undefined)}
              sendMessage={sendMessage}
              token={token}
              onMessage={(message, messageId, imitationId) => {
                onThreadMessage(message, messageId, imitationId);
              }}
            />
          )
        }
        rightRef={ref}
      />
    </>
  );
}
