import { useEffect, useState, useRef } from 'react';
import Layouts from '@linen/ui/Layouts';
import Pages from '@linen/ui/Pages';
import Toast from '@linen/ui/Toast';
import Thread from '@linen/ui/Thread';
import Empty from './Empty';
import { sendMessageWrapper } from './utilities/sendMessageWrapper';
import useKeyboard from '@linen/hooks/keyboard';
import { useUsersContext } from '@linen/contexts/Users';
import {
  ReminderTypes,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  Settings,
  ThreadState,
  Permissions,
  SerializedAccount,
} from '@linen/types';
import { addMessageToThread } from './state';
import { addReactionToThread } from 'utilities/state/reaction';
import { postReaction } from '@linen/ast';
import { api } from 'utilities/requests';
import Actions from 'components/Actions';
import JoinChannelLink from 'components/Link/JoinChannelLink';

const { Header, Grid } = Pages.Starred;
const { SidebarLayout } = Layouts.Shared;

interface DataResponse {
  threads: SerializedThread[];
  total: number;
}

interface Props {
  fetchData({
    communityName,
    page,
    limit,
  }: {
    communityName: string;
    page: number;
    limit: number;
  }): Promise<DataResponse>;
  fetchThread(threadId: string): Promise<SerializedThread>;
  putThread(
    threadId: string,
    options: {
      state?: ThreadState | undefined;
      title?: string | undefined;
    }
  ): Promise<SerializedThread>;
  dms: SerializedChannel[];
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  settings: Settings;
}

const LIMIT = 10;

export default function Content({
  fetchData,
  fetchThread,
  putThread,
  currentCommunity,
  isSubDomainRouting,
  permissions,
  settings,
  dms,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DataResponse>({ threads: [], total: 0 });
  const [page, setPage] = useState<number>(1);
  const [key, setKey] = useState(0);
  const [thread, setThread] = useState<SerializedThread>();
  const ref = useRef<HTMLDivElement>(null);
  const [allUsers] = useUsersContext();

  const token = permissions.token || null;
  const currentUser = permissions.user || null;
  const { communityId, communityName } = settings;

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
    postReaction({
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

    return fetch('/api/starred', {
      method: 'DELETE',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        threadId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to star the thread.');
        }
      })
      .catch((exception) => {
        Toast.error(
          exception?.message || 'Something went wrong. Please try again.'
        );
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
      .then((data: DataResponse) => {
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
    return fetch('/api/user-thread-status', {
      method: 'POST',
      body: JSON.stringify({
        communityId: currentCommunity.id,
        threadIds: [threadId],
        muted,
        reminder,
        read,
        reminderType,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
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
              {...{
                Actions,
                fetchMentions: (term?: string) => {
                  if (!term) return Promise.resolve([]);
                  return api.fetchMentions(term, currentCommunity.id);
                },
                JoinChannelLink,
                api,
                useUsersContext,
              }}
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
            />
          )
        }
        rightRef={ref}
      />
    </>
  );
}
