import { useState, useRef, useCallback } from 'react';
import { Layouts, Pages, Toast } from '@linen/ui';
import Thread from './Thread';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import usePolling from '@linen/hooks/polling';
import useKeyboard from '@linen/hooks/keyboard';
// import { useUsersContext } from '@linen/contexts/Users';
import useInboxWebsockets from '@linen/hooks/websockets/inbox';
// import type { CommunityPushType } from 'services/push';
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

const { Header, Filters, Grid } = Pages.Inbox;
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
    state,
    scope,
    page,
  }: {
    communityName: string;
    state: ThreadState;
    scope: Scope;
    page: number;
  }): Promise<InboxResponse>;
  fetchThread(threadId: string): Promise<SerializedThread>;
  putThread(threadId: string, options: object): Promise<any>;
  fetchTotal({
    communityName,
    state,
    scope,
  }: {
    communityName: string;
    state: ThreadState;
    scope: Scope;
  }): Promise<InboxResponse>;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

export default function Inbox({
  fetchInbox,
  fetchThread,
  putThread,
  fetchTotal,
  isSubDomainRouting,
  permissions,
  settings,
}: Props) {
  const [inbox, setInbox] = useState<InboxResponse>({ threads: [], total: 0 });
  const [state, setState] = useState<ThreadState>(ThreadState.OPEN);
  const [scope, setScope] = useState<Scope>(Scope.All);
  const [page, setPage] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [thread, setThread] = useState<SerializedThread>();
  const ref = useRef<HTMLDivElement>(null);
  // const [allUsers] = useUsersContext();
  const allUsers = [];
  // const { startSignUp } = useJoinContext();
  const { isShiftPressed } = useKeyboard();

  const token = permissions.token || null;
  const currentUser = permissions.user || null;
  const { communityId, communityName } = settings;

  const onNewMessage = useCallback(
    (payload: any) => {
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
        setInbox(prependThread(thread));
      }
      if (message) {
        if (filterByScope(scope, [message], currentUser)) {
          return;
        }
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

  useInboxWebsockets({
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
        return fetchInbox({ communityName, state, scope, page });
      },
      success(data: InboxResponse) {
        setInbox((f) => ({ ...f, threads: data.threads }));
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
      success(data: InboxResponse) {
        setInbox((f) => ({ ...f, total: data.total }));
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
      .then((response: any) => {
        if (response.ok) {
          if (options.state) {
            setKey((key) => key + 1);
          }
          return;
        }
        throw new Error('Failed to close the thread.');
      })
      .catch((exception: Error) => {
        Toast.error(exception.message);
      });
  };

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setThread,
    setInbox,
    communityId,
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
              total={inbox.total}
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
              threads={inbox.threads}
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
                    ids: inbox.threads.map((thread) => thread.id),
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
