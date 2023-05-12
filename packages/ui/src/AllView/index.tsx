import React, { useEffect, useState, useRef } from 'react';
import Layouts from '@/Layouts';
import Pages from '@/Pages';
import Toast from '@/Toast';
import Thread from '@/Thread';
import Empty from './Empty';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import useKeyboard from '@linen/hooks/keyboard';
import { useUsersContext } from '@linen/contexts/Users';
import {
  ReminderTypes,
  SerializedMessage,
  SerializedThread,
  Settings,
  ThreadState,
  Permissions,
  SerializedAccount,
  AllResponse,
} from '@linen/types';
import { addMessageToThread } from './state';
import debounce from '@linen/utilities/debounce';
import type { ApiClient } from '@linen/api-client';

const { Header, Grid } = Pages.All;
const { SidebarLayout } = Layouts.Shared;

interface Props {
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
  api: ApiClient;
  JoinChannelLink({ className, href, communityType }: any): JSX.Element;
  addReactionToThread: any;
}

const LIMIT = 10;

export default function AllView({
  currentCommunity,
  isSubDomainRouting,
  permissions,
  settings,
  api,
  addReactionToThread,
  JoinChannelLink,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AllResponse>({ threads: [], total: 0 });
  const [page, setPage] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [thread, setThread] = useState<SerializedThread>();
  const ref = useRef<HTMLDivElement>(null);
  const [allUsers] = useUsersContext();

  const token = permissions.token || null;
  const currentUser = permissions.user || null;
  const { communityId, communityName } = settings;

  const fetchData = debounce(api.fetchAll);

  async function sendReaction({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }) {
    setThread((thread) => {
      if (!thread) {
        return thread;
      }
      return addReactionToThread(thread, {
        threadId,
        messageId,
        type,
        active,
        currentUser,
      });
    });
    setData((data) => {
      const { threads, ...rest } = data;

      return {
        threads: threads.map((thread) =>
          addReactionToThread(thread, {
            threadId,
            messageId,
            type,
            active,
            currentUser,
          })
        ),
        ...rest,
      };
    });
    api.postReaction({
      communityId: currentCommunity.id,
      messageId,
      type,
      action: active ? 'decrement' : 'increment',
    });
  }

  async function updateThreadResolution(threadId: string, messageId?: string) {
    setData((data) => {
      const { threads, ...rest } = data;
      return {
        threads: threads.map((thread) => {
          if (thread.id === threadId) {
            return { ...thread, resolutionId: messageId };
          }
          return thread;
        }),
        ...rest,
      };
    });

    setThread((thread) => {
      if (thread?.id === threadId) {
        return {
          ...thread,
          resolutionId: messageId,
        };
      }
      return thread;
    });

    return api
      .updateThread({
        id: threadId,
        resolutionId: messageId,
        accountId: settings.communityId,
      })
      .catch((_) => {
        Toast.error('Failed to mark as resolution');
      });
  }

  async function unstarThread(threadId: string) {
    setData((data) => {
      const { threads, ...rest } = data;
      return {
        threads: threads.filter((thread) => thread.id !== threadId),
        ...rest,
      };
    });
    setThread((thread) => {
      if (thread?.id === threadId) {
        return undefined;
      }
      return thread;
    });

    return api
      .removeStar({
        communityId: currentCommunity.id,
        threadId,
      })
      .catch((exception) => {
        Toast.error('Failed to star the thread.');
      });
  }

  const onThreadMessage = (
    threadId: string,
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) => {
    setThread((thread) =>
      addMessageToThread(thread, threadId, message, messageId, imitationId)
    );
  };

  useEffect(() => {
    let mounted = true;
    fetchData({
      communityName,
      page,
      limit: LIMIT,
    })
      .then((data) => {
        if (mounted) {
          setLoading(false);
          setData(data);
          setThread(data.threads[0]);
        }
      })
      .catch(() => {
        Toast.error('Something went wrong. Please try again.');
      });
    return () => {
      mounted = false;
    };
  }, [key, page]);

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

    setData((data) => {
      return {
        ...data,
        threads: data.threads.map((dataThread) => {
          if (dataThread.id === thread.id) {
            return {
              ...dataThread,
              ...options,
            };
          }
          return dataThread;
        }),
      };
    });

    return api
      .updateThread({ id: thread.id, accountId: communityId, ...options })
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

  function markUserThreadStatuses({
    threadId,
    muted,
    reminder,
    read,
    reminderType,
  }: {
    threadId: string;
    muted: boolean;
    reminder: boolean;
    read: boolean;
    reminderType?: ReminderTypes;
  }) {
    setLoading(true);
    setData((data) => {
      const { threads, ...rest } = data;

      return {
        threads: threads.filter((thread) => thread.id !== threadId),
        ...rest,
      };
    });
    setThread((thread) => {
      if (thread) {
        if (thread.id === threadId) {
          const index = threads.findIndex((thread) => thread.id === threadId);
          return threads[index + 1] || threads[0];
        }
      }
      return thread;
    });
    return api
      .upsertUserThreadStatus({
        communityId: currentCommunity.id,
        threadIds: [threadId],
        muted,
        reminder,
        read,
        reminderType,
      })
      .then(() => {
        return fetchData({
          communityName,
          page,
          limit: LIMIT,
        }).then((data) => {
          setData(data);
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function deleteMessage(messageId: string) {
    setData((data) => {
      const { threads, ...rest } = data;
      return {
        threads: threads
          .map((thread) => {
            const message = thread.messages.find(
              (message) => message.id === messageId
            );
            if (message) {
              const messages = thread.messages.filter(
                (message) => message.id !== messageId
              );
              if (messages.length === 0) {
                return null;
              }
              return {
                ...thread,
                messages,
                messageCount: thread.messageCount - 1,
              };
            }
            return thread;
          })
          .filter(Boolean) as SerializedThread[],
        ...rest,
      };
    });

    setThread((thread) => {
      if (thread) {
        const messageIds = thread.messages.map(({ id }) => id);
        if (messageIds.includes(messageId)) {
          const messages = thread.messages.filter(({ id }) => id !== messageId);
          if (messages.length === 0) {
            return undefined;
          }
          return {
            ...thread,
            messages,
          };
        }
      }
      return thread;
    });

    return api
      .deleteMessage({ id: messageId, accountId: currentCommunity.id })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new Error('Failed to delete the message.');
      })
      .catch((_) => {
        Toast.error('Failed to delete the message.');
      });
  }

  function markThreadAsRead(threadId: string) {
    markUserThreadStatuses({
      threadId,
      read: true,
      muted: false,
      reminder: false,
    });
  }

  function markThreadAsMuted(threadId: string) {
    markUserThreadStatuses({
      threadId,
      read: false,
      muted: true,
      reminder: false,
    });
  }

  function onRemind(threadId: string, reminderType: ReminderTypes) {
    markUserThreadStatuses({
      threadId,
      muted: false,
      read: false,
      reminder: true,
      reminderType,
    });
  }

  const sendMessage = sendMessageWrapper({
    currentUser,
    allUsers,
    setThread,
    setData,
    communityId,
    api,
  });

  useKeyboard(
    {
      onKeyUp(event: KeyboardEvent) {
        const element = document.activeElement;
        if (element && element.id) {
          return false;
        }

        const { threads } = data;
        const currentThreadId = thread?.id;
        if (!currentThreadId) {
          return false;
        }
        function selectPreviousThread() {
          const index = threads.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index > 0) {
            const thread = threads[index - 1];
            setThread(thread);
          }
        }

        function selectNextThread() {
          const index = threads.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index < threads.length - 1) {
            const thread = threads[index + 1];
            setThread(thread);
          }
        }

        if (threads.length > 0) {
          if (event.key === 'ArrowUp' || event.key === 'k') {
            selectPreviousThread();
          } else if (event.key === 'ArrowDown' || event.key === 'j') {
            selectNextThread();
          } else if (event.key === 'e') {
            markThreadAsRead(currentThreadId);
          } else if (event.key === 'm') {
            markThreadAsMuted(currentThreadId);
          }
        }
      },
    },
    [data, thread]
  );

  const { threads } = data;

  return (
    <>
      <SidebarLayout
        left={
          <>
            <Header
              total={data.total}
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
            {threads.length > 0 ? (
              <Grid
                currentThreadId={thread?.id}
                threads={data.threads}
                onRead={markThreadAsRead}
                onMute={markThreadAsMuted}
                onRemind={onRemind}
                onUnstar={unstarThread}
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
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return api.fetchMentions(term, currentCommunity.id);
              }}
              JoinChannelLink={JoinChannelLink}
              api={api}
              key={thread.id}
              thread={thread}
              channelId={thread.channelId}
              channelName={thread.channel?.channelName as string}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              permissions={permissions}
              currentUser={currentUser}
              onClose={() => setThread(undefined)}
              onReaction={sendReaction}
              onResolution={updateThreadResolution}
              onDelete={deleteMessage}
              updateThread={updateThread}
              sendMessage={sendMessage}
              token={token}
              onMessage={(threadId, message, messageId, imitationId) => {
                onThreadMessage(threadId, message, messageId, imitationId);
              }}
              useUsersContext={useUsersContext}
            />
          )
        }
        rightRef={ref}
      />
    </>
  );
}
