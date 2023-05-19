import React, { useEffect, useState } from 'react';
import Toast from '@/Toast';
import useWebsockets from '@linen/hooks/websockets';
import useKeyboard from '@linen/hooks/keyboard';
import { useViewport } from '@linen/hooks/useViewport';
import { localStorage } from '@linen/utilities/storage';
import {
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  Settings,
  ThreadState,
  Permissions,
  UploadedFile,
} from '@linen/types';
import { ChannelContext } from '@linen/contexts/channel';
import debounce from '@linen/utilities/debounce';
import { createThreadImitation } from '@linen/serializers/thread';
import type { ApiClient } from '@linen/api-client';
import Content from './Content';
import { addReaction } from '@linen/utilities/reaction';

const SHORTCUTS_ENABLED = false;

export default function ChannelView({
  threads: initialThreads,
  pinnedThreads: initialPinnedThreads,
  currentChannel: initialChannel,
  currentCommunity,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
  permissions,
  useJoinContext,
  queryIntegration,
  playNotificationSound,
  useUsersContext,
  usePath,
  routerPush,
  api,
}: {
  settings: Settings;
  channelName: string;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  pinnedThreads: SerializedThread[];
  isSubDomainRouting: boolean;
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
  pathCursor: string | null;
  isBot: boolean;
  permissions: Permissions;
  useJoinContext: () => {
    startSignUp?: any;
  };
  queryIntegration?: any;
  playNotificationSound: (volume: number) => Promise<void>;
  useUsersContext(): any;
  usePath(options: any): any;
  routerPush(path: string): void;
  api: ApiClient;
}) {
  const viewport = useViewport();
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [pinnedThreads, setPinnedThreads] =
    useState<SerializedThread[]>(initialPinnedThreads);
  const [currentChannel, setCurrentChannel] = useState(initialChannel);
  const [allUsers] = useUsersContext();

  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(
    viewport === 'desktop' ? threads[threads.length - 1]?.id : undefined
  );

  const debouncedUpserUserThreadStatus = debounce(api.upsertUserThreadStatus);

  const currentUser = permissions.user || null;
  const token = permissions.token || null;

  useEffect(() => {
    setThreads(initialThreads);
    if (viewport === 'desktop') {
      setCurrentThreadId(initialThreads[initialThreads.length - 1]?.id);
    }
  }, [initialThreads, viewport]);

  useEffect(() => {
    setPinnedThreads(initialPinnedThreads);
  }, [initialPinnedThreads]);

  useEffect(() => {
    setCurrentChannel(initialChannel);
  }, [initialChannel]);

  useEffect(() => {
    localStorage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'channel',
      channelId: currentChannel.id,
    });
  }, [currentCommunity, currentChannel]);

  useKeyboard(
    {
      onKeyUp(event: KeyboardEvent) {
        const element = document.activeElement;
        if (element && element.id) {
          return false;
        }
        if (!currentUser) {
          return false;
        }
        function scrollToBottomThread(threadId: string) {
          const node = document.getElementById(threadId);
          const layout = document.getElementById('sidebar-layout-left');
          const footer = document.getElementById('chat-layout-footer');
          if (node && layout && footer) {
            node.scrollIntoView({ block: 'end' });
            const offset = footer.clientHeight;
            layout.scrollTop = layout.scrollTop + offset;
          }
        }
        function selectPreviousThread() {
          const index = threads.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index > 0) {
            const threadId = threads[index - 1].id;
            setCurrentThreadId(threadId);
            scrollToBottomThread(threadId);
          }
        }

        function selectNextThread() {
          const index = threads.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index < threads.length - 1) {
            const threadId = threads[index + 1].id;
            setCurrentThreadId(threadId);
            scrollToBottomThread(threadId);
          }
        }

        if (currentThreadId && (event.key === 'ArrowUp' || event.key === 'k')) {
          selectPreviousThread();
        } else if (
          currentThreadId &&
          (event.key === 'ArrowDown' || event.key === 'j')
        ) {
          selectNextThread();
        } else if (
          SHORTCUTS_ENABLED &&
          currentThreadId &&
          event.shiftKey &&
          event.key === 'E'
        ) {
          markUserThreadStatuses(currentThreadId, {
            muted: false,
            read: false,
            reminder: false,
          });
          selectPreviousThread();
        } else if (SHORTCUTS_ENABLED && currentThreadId && event.key === 'e') {
          markUserThreadStatuses(currentThreadId, {
            muted: false,
            read: true,
            reminder: false,
          });
          selectPreviousThread();
        } else if (
          SHORTCUTS_ENABLED &&
          currentThreadId &&
          event.shiftKey &&
          event.key === 'M'
        ) {
          markUserThreadStatuses(currentThreadId, {
            muted: false,
            read: false,
            reminder: false,
          });
          selectPreviousThread();
        } else if (SHORTCUTS_ENABLED && currentThreadId && event.key === 'm') {
          markUserThreadStatuses(currentThreadId, {
            muted: true,
            read: false,
            reminder: false,
          });
          selectPreviousThread();
        }
      },
    },
    [threads, currentThreadId, currentUser]
  );

  const auth = permissions.auth || null;
  const authId = auth?.id;

  async function updateUserThreadStatusesOnWebsocketEvents(payload: any) {
    const channelId = payload.channel_id;
    const threadId = payload.thread_id;
    if (threadId && currentChannel.id === channelId) {
      const thread = threads.find((thread) => thread.id === threadId);
      if (!thread) {
        // get full thread from an endpoint and push it to threads
        try {
          // FIXME
          const thread = await api.getThread({
            id: threadId,
            accountId: currentCommunity.id,
          });
          setThreads((threads) => [...threads, thread]);
        } catch (exception) {
          if (process.env.NODE_ENV === 'development') {
            console.error(exception);
          }
        }
      }
    }
  }

  useWebsockets({
    room: authId && `user:${authId}`,
    permissions,
    token,
    onNewMessage: updateUserThreadStatusesOnWebsocketEvents,
  });

  useEffect(() => {
    if (currentUser && window.Notification) {
      const permission = localStorage.get('notification.permission');
      if (!permission) {
        window.Notification.requestPermission((permission) => {
          localStorage.set('notification.permission', permission);
          if (permission === 'granted') {
            Toast.info('Notifications are enabled');
            new Notification('Notifications are enabled');
          }
        });
      }
    }
  }, []);

  const onSocket = (payload: any) => {
    try {
      if (payload.is_reply) {
        const threadId = payload.thread_id;
        const messageId = payload.message_id;
        const imitationId = payload.imitation_id;
        const message: SerializedMessage =
          payload.message && JSON.parse(payload.message);
        if (!message) {
          return;
        }
        setThreads((threads) => {
          const index = threads.findIndex(({ id }) => id === threadId);
          const newThreads = [...threads];
          if (index > -1) {
            newThreads[index].messages = [
              ...newThreads[index].messages.filter(
                ({ id }) => id !== imitationId && id !== messageId
              ),
              message,
            ];
          }
          return newThreads;
        });

        updateUserThreadStatusesOnWebsocketEvents(payload);
      }

      if (payload.is_thread) {
        const threadId = payload.thread_id;
        const imitationId = payload.imitation_id;
        const thread: SerializedThread =
          payload.thread && JSON.parse(payload.thread);
        if (!thread) {
          return;
        }
        setThreads((threads) => [
          ...threads.filter(({ id }) => id !== imitationId && id !== threadId),
          thread,
        ]);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.log(e);
      }
    }
  };

  function onSelectThread(threadId?: string) {
    setCurrentThreadId(threadId);
    if (threadId) {
      setTimeout(() => {
        const node = document.getElementById(
          `thread-message-form-${threadId}-textarea`
        );
        if (node) {
          node.focus();
        }
      }, 0);
    }
  }

  async function deleteMessage(messageId: string) {
    setThreads((threads) => {
      return threads
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
        .filter(Boolean) as SerializedThread[];
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

  function markUserThreadStatuses(
    threadId: string,
    {
      muted,
      read,
      reminder,
      reminderType,
    }: {
      muted: boolean;
      read: boolean;
      reminder: boolean;
      reminderType?: ReminderTypes;
    }
  ) {
    debouncedUpserUserThreadStatus({
      communityId: currentCommunity.id,
      threadIds: [threadId],
      muted,
      read,
      reminder,
      reminderType,
    });
    setThreads((threads) => {
      return threads.filter((thread) => thread.id !== threadId);
    });
  }

  async function muteThread(threadId: string) {
    Toast.info('Thread was muted.');
    markUserThreadStatuses(threadId, {
      muted: true,
      read: false,
      reminder: false,
    });
  }

  async function unmuteThread(threadId: string) {
    Toast.info('Thread was unmuted.');
    markUserThreadStatuses(threadId, {
      muted: false,
      read: false,
      reminder: false,
    });
  }

  async function readThread(threadId: string) {
    Toast.info('Thread was marked as read.');
    markUserThreadStatuses(threadId, {
      muted: false,
      read: true,
      reminder: false,
    });
  }

  async function unreadThread(threadId: string) {
    Toast.info('Thread was marked as unread.');
    markUserThreadStatuses(threadId, {
      muted: false,
      read: false,
      reminder: false,
    });
  }

  function onRemind(threadId: string, reminderType: ReminderTypes) {
    Toast.info('We will remind you later about this thread.');
    markUserThreadStatuses(threadId, {
      muted: false,
      read: false,
      reminder: true,
      reminderType,
    });
  }

  async function pinThread(threadId: string) {
    const thread =
      threads.find(({ id }) => id === threadId) ||
      pinnedThreads.find(({ id }) => id === threadId);
    if (!thread) {
      return;
    }
    const newPinned = !thread.pinned;
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === threadId) {
          return { ...thread, pinned: newPinned };
        }
        return thread;
      });
    });
    setPinnedThreads((pinnedThreads) => {
      if (newPinned) {
        return [...pinnedThreads, { ...thread, pinned: true }];
      } else {
        return pinnedThreads.filter(({ id }) => id !== threadId);
      }
    });
    return api
      .updateThread({
        accountId: currentCommunity.id,
        id: thread.id,
        pinned: newPinned,
      })
      .catch((_) => {
        Toast.error('Failed to pin the thread.');
      });
  }

  async function starThread(threadId: string) {
    return api
      .starThread({ threadId, communityId: currentCommunity.id })
      .then(() => {
        Toast.success('Starred successfully.');
      })
      .catch((exception) => {
        if (exception.status === 409) {
          Toast.info('Thread is already starred.');
        } else {
          Toast.error(
            exception?.message || 'Something went wrong. Please try again.'
          );
        }
      });
  }

  async function updateThreadResolution(threadId: string, messageId?: string) {
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === threadId) {
          return { ...thread, resolutionId: messageId };
        }
        return thread;
      });
    });

    return api
      .updateThread({
        id: threadId,
        resolutionId: messageId || null,
        accountId: settings.communityId,
      })
      .catch((_) => {
        Toast.error('Failed to mark as resolution');
      });
  }

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
    function addReactionToThreads(threads: SerializedThread[]) {
      return addReaction(threads, {
        threadId,
        messageId,
        type,
        active,
        currentUser,
      });
    }
    setThreads(addReactionToThreads);
    setPinnedThreads(addReactionToThreads);
    api.postReaction({
      communityId: currentCommunity.id,
      messageId,
      type,
      action: active ? 'decrement' : 'increment',
    });
  }

  const mergeThreads = ({ from, to }: { from: string; to: string }) => {
    const source = threads.find((thread) => thread.id === from);
    const target = threads.find((thread) => thread.id === to);

    setThreads((threads) => {
      if (!source || !target) {
        return threads;
      }
      return threads
        .map((thread) => {
          if (thread.id === from) {
            return null;
          }
          if (thread.id === to) {
            return {
              ...thread,
              messages: [...thread.messages, ...source.messages].sort(
                (a, b) => {
                  return (
                    new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                  );
                }
              ),
            };
          }
          return thread;
        })
        .filter(Boolean) as SerializedThread[];
    });
    if (!source || !target) {
      return Promise.resolve();
    }
    return api.mergeThreadsRequest({
      from: source.id,
      to: target.id,
      communityId: currentCommunity.id,
    });
  };

  const moveMessageToThread = ({
    messageId,
    threadId,
  }: {
    messageId: string;
    threadId: string;
  }) => {
    const messages = [...threads.map((thread) => thread.messages)].flat();
    const message = messages.find(({ id }) => id === messageId);

    setThreads((threads) => {
      if (!message) {
        return threads;
      }
      return threads
        .map((thread) => {
          if (thread.id === threadId) {
            const ids = thread.messages.map(({ id }) => id);
            if (ids.includes(messageId)) {
              return thread;
            }
            return {
              ...thread,
              messages: [...thread.messages, message].sort((a, b) => {
                return (
                  new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
                );
              }),
            };
          }
          const ids = thread.messages.map(({ id }) => id);
          if (ids.includes(messageId)) {
            return {
              ...thread,
              messages: thread.messages.filter(({ id }) => id !== messageId),
            };
          }
          return thread;
        })
        .filter(Boolean) as SerializedThread[];
    });

    return api.moveMessageToThreadRequest({
      messageId,
      threadId,
      communityId: currentCommunity.id,
    });
  };

  const moveMessageToChannel = ({
    messageId,
    channelId,
  }: {
    messageId: string;
    channelId: string;
  }) => {
    const messages = [...threads.map((thread) => thread.messages)].flat();
    const message = messages.find(({ id }) => id === messageId);
    if (!message) {
      return;
    }
    const imitation =
      currentChannel.id === channelId &&
      createThreadImitation({
        message: message.body,
        files: message.attachments.map((attachment) => {
          return {
            id: attachment.name,
            url: attachment.url,
          };
        }),
        author: message.author as SerializedUser,
        mentions: allUsers,
        channel: currentChannel,
      });

    setThreads((threads) => {
      const result = threads.map((thread) => {
        const ids = thread.messages.map(({ id }) => id);
        if (ids.includes(messageId)) {
          return {
            ...thread,
            messages: thread.messages.filter(({ id }) => id !== messageId),
          };
        }

        return thread;
      });

      if (imitation) {
        return [...result, imitation];
      }

      return result;
    });

    return api
      .moveMessageToChannelRequest({
        messageId,
        channelId,
        communityId: currentCommunity.id,
      })
      .then((thread) => {
        setThreads((threads) => {
          if (imitation) {
            return threads.map((current) => {
              if (current.id === imitation.id) {
                return thread;
              }
              return current;
            });
          }
          return threads;
        });
      });
  };

  const updateThread = ({
    state: newState,
    title: newTitle,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    if (!currentThreadId) {
      return;
    }
    const options: { state?: ThreadState; title?: string } = {};
    if (newState) {
      options.state = newState;
    }
    if (newTitle) {
      options.title = newTitle;
    }
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === currentThreadId) {
          return {
            ...thread,
            ...options,
          };
        }
        return thread;
      });
    });
    return api
      .updateThread({
        accountId: settings.communityId,
        id: currentThreadId,
        ...options,
      })
      .catch((_) => {
        Toast.error('Failed to close the thread.');
      });
  };

  const editThread = ({
    id,
    message,
    title,
    files,
  }: {
    id: string;
    message: string;
    title?: string;
    files: UploadedFile[];
  }) => {
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === id) {
          const messages = thread.messages;
          messages[0].body = message;
          return {
            ...thread,
            title,
            messages,
          };
        }
        return thread;
      });
    });
    return api
      .updateThread({
        accountId: settings.communityId,
        id,
        title,
        message,
      })
      .then(() => {
        Toast.success('Updated successfully.');
      })
      .catch((_) => {
        Toast.error('Failed to edit the thread.');
      });
  };

  const editMessage = ({
    id: messageId,
    body,
  }: {
    id: string;
    body: string;
  }) => {
    setThreads((threads) => {
      return threads.map((thread) => {
        const message = thread.messages.find(
          ({ id }: SerializedMessage) => id === messageId
        );
        if (message) {
          return {
            ...thread,
            messages: thread.messages.map((message: SerializedMessage) => {
              if (message.id === messageId) {
                return {
                  ...message,
                  body,
                };
              }
              return message;
            }),
          };
        }
        return thread;
      });
    });
    return api
      .updateMessage({
        accountId: settings.communityId,
        id: messageId,
        body,
      })
      .then(() => {
        Toast.success('Updated successfully.');
      })
      .catch((_) => {
        Toast.error('Failed to edit the message.');
      });
  };

  function onThreadMessage(
    threadId: string,
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) {
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            messages: [
              ...thread.messages.filter(
                ({ id }: any) => id !== imitationId && id !== messageId
              ),
              message,
            ],
          };
        }
        return thread;
      });
    });
  }

  function onThreadDrop({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }) {
    if (source === 'thread' && target === 'thread') {
      return mergeThreads({ from, to });
    } else if (source === 'message' && target === 'thread') {
      return moveMessageToThread({
        messageId: from,
        threadId: to,
      });
    } else if (source === 'message' && target === 'channel') {
      return moveMessageToChannel({ messageId: from, channelId: to });
    }
  }

  return (
    <ChannelContext.Provider value={currentChannel}>
      <Content
        useJoinContext={useJoinContext}
        queryIntegration={queryIntegration}
        playNotificationSound={playNotificationSound}
        useUsersContext={useUsersContext}
        usePath={usePath}
        routerPush={routerPush}
        api={api}
        key={currentChannel.channelName}
        threads={threads}
        pinnedThreads={pinnedThreads}
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        settings={settings}
        channelName={channelName}
        isSubDomainRouting={isSubDomainRouting}
        nextCursor={nextCursor}
        isBot={isBot}
        permissions={permissions}
        currentThreadId={currentThreadId}
        setThreads={setThreads}
        deleteMessage={deleteMessage}
        editMessage={editMessage}
        muteThread={muteThread}
        unmuteThread={unmuteThread}
        pinThread={pinThread}
        starThread={starThread}
        updateThreadResolution={updateThreadResolution}
        readThread={readThread}
        unreadThread={unreadThread}
        onMessage={onThreadMessage}
        onDrop={onThreadDrop}
        onRemind={onRemind}
        sendReaction={sendReaction}
        onSelectThread={onSelectThread}
        editThread={editThread}
        updateThread={updateThread}
        onThreadMessage={onSocket}
        token={token}
        pathCursor={pathCursor}
      />
    </ChannelContext.Provider>
  );
}
