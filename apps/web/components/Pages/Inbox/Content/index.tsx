import { useState, useRef, useCallback } from 'react';
import { Layouts, Pages, Toast } from '@linen/ui';
import Thread from 'components/Thread';
import Empty from './Empty';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import usePolling from '@linen/hooks/polling';
import useKeyboard from '@linen/hooks/keyboard';
import { useUsersContext } from '@linen/contexts/Users';
import { useJoinContext } from 'contexts/Join';
import useInboxWebsockets from '@linen/hooks/websockets/inbox';
import type { CommunityPushType } from 'services/push';
import { manageSelections } from './utilities/selection';
import {
  SerializedMessage,
  SerializedThread,
  Settings,
  ThreadState,
  Permissions,
  SerializedAccount,
} from '@linen/types';
import { addMessageToThread, prependThread } from './state';

const { Header, Grid } = Pages.Inbox;
const { SidebarLayout } = Layouts.Shared;

interface InboxResponse {
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
  fetchInbox({
    communityName,
    page,
    limit,
  }: {
    communityName: string;
    page: number;
    limit: number;
  }): Promise<InboxResponse>;
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
  }: {
    communityName: string;
  }): Promise<InboxResponse>;
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const LIMIT = 10;

export default function Inbox({
  fetchInbox,
  fetchThread,
  putThread,
  fetchTotal,
  currentCommunity,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [inbox, setInbox] = useState<InboxResponse>({ threads: [], total: 0 });
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
        setInbox(prependThread(thread));
      }
      if (message) {
        const thread = inbox.threads.find((t) => t.id === message.threadId);
        if (thread) {
          setInbox(prependThread(thread, message));
        } else {
          fetchThread(payload.thread_id).then((thread) =>
            setInbox(prependThread(thread, message))
          );
        }
      }
    },
    [currentUser?.id]
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

  useInboxWebsockets({
    communityId,
    onNewMessage,
    permissions,
    token,
  });

  const [polling] = usePolling(
    {
      fetch(): any {
        return fetchInbox({ communityName, page, limit: LIMIT });
      },
      success(data: InboxResponse) {
        setLoading(false);
        setInbox((inbox) => ({ ...inbox, threads: data.threads }));
      },
      error() {
        Toast.error('Something went wrong. Please reload the page.');
      },
    },
    [communityName, page, key]
  );

  const [totalPolling] = usePolling(
    {
      fetch(): any {
        return fetchTotal({ communityName });
      },
      success(data: InboxResponse) {
        setInbox((inbox) => ({ ...inbox, total: data.total }));
      },
      error() {},
    },
    [communityName]
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

    setInbox((inbox) => {
      return {
        ...inbox,
        threads: inbox.threads.map((inboxThread) => {
          if (inboxThread.id === thread.id) {
            return {
              ...inboxThread,
              ...options,
            };
          }
          return inboxThread;
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

  function onMarkAllAsRead() {
    setThread(undefined);
    const { threads } = inbox;
    const threadIds =
      threads.length < LIMIT && page === 1 ? threads.map(({ id }) => id) : [];
    setInbox({ threads: [], total: 0 });
    return fetch('/api/user-thread-status', {
      method: 'POST',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        threadIds,
        muted: false,
        reminder: false,
        read: true,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  function markThreadAsRead(threadId: string) {
    setKey((key) => key + 1);
    return fetch('/api/user-thread-status', {
      method: 'POST',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        threadIds: [threadId],
        muted: false,
        reminder: false,
        read: true,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setThread,
    setInbox,
    communityId,
    startSignUp,
  });

  const { threads } = inbox;

  return (
    <>
      <SidebarLayout
        left={
          <>
            <Header
              total={inbox.total}
              threads={inbox.threads}
              isFetchingTotal={totalPolling}
              page={page}
              onMarkAllAsRead={onMarkAllAsRead}
              onPageChange={(type: string) => {
                switch (type) {
                  case 'back':
                    return setPage((page) => page - 1);
                  case 'next':
                    return setPage((page) => page + 1);
                }
              }}
            />
            {threads.length > 0 ? (
              <Grid
                threads={inbox.threads}
                loading={polling}
                selections={selections}
                permissions={permissions}
                onRead={markThreadAsRead}
                onChange={(id: string, checked: boolean, index: number) => {
                  setSelections((selections: Selections) => {
                    return manageSelections({
                      id,
                      checked,
                      index,
                      selections,
                      ids: inbox.threads.map((thread) => thread.id),
                      isShiftPressed,
                    });
                  });
                }}
                onSelect={(thread: SerializedThread) => {
                  setThread(thread);
                }}
              />
            ) : (
              <Empty loading={loading} />
            )}
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
