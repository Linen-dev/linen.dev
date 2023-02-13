import { useState, useRef, useCallback } from 'react';
import { Layouts, Pages, Toast } from '@linen/ui';
import Thread from './Thread';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import usePolling from '@linen/hooks/polling';
import useKeyboard from '@linen/hooks/keyboard';
import useInboxWebsockets from '@linen/hooks/websockets/inbox';
import { manageSelections } from './utilities/selection';
import {
  SerializedMessage,
  SerializedThread,
  Settings,
  ThreadState,
  Permissions,
  Scope,
} from '@linen/types';
import { addMessageToThread, prependThread } from './state';

const { Grid } = Pages.Inbox;
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
  }: {
    communityName: string;
    page: number;
  }): Promise<InboxResponse>;
  fetchThread(threadId: string): Promise<SerializedThread>;
  putThread(threadId: string, options: object): Promise<any>;
  fetchTotal({
    communityName,
  }: {
    communityName: string;
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
  const [page] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [thread, setThread] = useState<SerializedThread>();
  const ref = useRef<HTMLDivElement>(null);
  const allUsers = [];
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
        return fetchInbox({ communityName, page });
      },
      success(data: InboxResponse) {
        setInbox((f) => ({ ...f, threads: data.threads }));
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
        setInbox((f) => ({ ...f, total: data.total }));
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
