/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import PageLayout from 'components/layout/PageLayout';
import { Toast } from '@linen/ui';
import { buildChannelSeo } from 'utilities/seo';
import Content from 'components/Pages/Channel/Content';
import {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  SerializedUserThreadStatus,
  Settings,
  ThreadState,
  ThreadStatus,
} from '@linen/types';
import {
  postReaction,
  mergeThreadsRequest,
  moveMessageToThreadRequest,
  moveMessageToChannelRequest,
  moveThreadToChannelRequest,
} from './Content/utilities/http';
import { createThreadImitation } from './Content/utilities/thread';
import { useUsersContext } from '@linen/contexts/Users';
import storage from '@linen/utilities/storage';
import ChannelForBots from './ChannelForBots';
import * as api from 'utilities/requests';
import debounce from '@linen/utilities/debounce';
import useWebsockets from '@linen/hooks/websockets';
import useKeyboard from '@linen/hooks/keyboard';

export interface ChannelProps {
  settings: Settings;
  channelName: string;
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  pinnedThreads: SerializedThread[];
  userThreadStatuses: SerializedUserThreadStatus[];
  isSubDomainRouting: boolean;
  nextCursor: {
    next: string | null;
    prev: string | null;
  };
  pathCursor: string | null;
  isBot: boolean;
  permissions: Permissions;
}

async function upsertUserThreadStatus(params: {
  communityId: string;
  threadId: string;
  muted: boolean;
  read: boolean;
}) {
  return fetch('/api/user-thread-status', {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

const debouncedUpserUserThreadStatus = debounce(upsertUserThreadStatus);

function getThreadsToRender(
  threads: SerializedThread[],
  userThreadStatuses: SerializedUserThreadStatus[],
  status: ThreadStatus
) {
  return threads.filter((thread) => {
    const userThreadStatus = userThreadStatuses.find(
      (userThreadStatus: any) => userThreadStatus.threadId === thread.id
    );
    if (userThreadStatus) {
      const { muted, read } = userThreadStatus;
      const isUnread = status === ThreadStatus.UNREAD && !read && !muted;
      const isRead = status === ThreadStatus.READ && read && !muted;
      const isMuted = status === ThreadStatus.MUTED && muted;
      if (isUnread || isRead || isMuted) {
        return thread;
      }
      return false;
    } else if (status === ThreadStatus.READ || status === ThreadStatus.MUTED) {
      return false;
    }
    return thread;
  });
}

export default function Channel(props: ChannelProps) {
  if (props.isBot) {
    return <ChannelForBots {...props} />;
  }

  const {
    threads: initialThreads,
    pinnedThreads: initialPinnedThreads,
    userThreadStatuses: initialUserThreadStatuses,
    channels,
    communities,
    currentChannel: initialChannel,
    currentCommunity,
    settings,
    channelName,
    isSubDomainRouting,
    nextCursor,
    pathCursor,
    isBot,
    permissions,
  } = props;

  const [status, setStatus] = useState<ThreadStatus>(ThreadStatus.UNREAD);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [pinnedThreads, setPinnedThreads] =
    useState<SerializedThread[]>(initialPinnedThreads);
  const [currentChannel, setCurrentChannel] = useState(initialChannel);
  const [allUsers] = useUsersContext();
  const [userThreadStatuses, setUserThreadStatuses] = useState<
    SerializedUserThreadStatus[]
  >(initialUserThreadStatuses);

  const threadsToRender = getThreadsToRender(
    threads,
    userThreadStatuses,
    status
  );

  const [currentThreadId, setCurrentThreadId] = useState<string | undefined>(
    threadsToRender[threadsToRender.length - 1]?.id
  );

  const currentUser = permissions.user || null;
  const token = permissions.token || null;

  useEffect(() => {
    const threadsToRender = getThreadsToRender(
      threads,
      userThreadStatuses,
      status
    );
    setCurrentThreadId(threadsToRender[threadsToRender.length - 1]?.id);
  }, [status]);

  useEffect(() => {
    setUserThreadStatuses(initialUserThreadStatuses);
  }, [initialUserThreadStatuses]);

  useEffect(() => {
    setThreads(initialThreads);
  }, [initialThreads]);

  useEffect(() => {
    setPinnedThreads(initialPinnedThreads);
  }, [initialPinnedThreads]);

  useEffect(() => {
    setCurrentChannel(initialChannel);
  }, [initialChannel]);

  useEffect(() => {
    storage.set('pages.last', {
      communityId: currentCommunity.id,
      page: 'channel',
      channelId: currentChannel.id,
    });
  }, [currentCommunity, currentChannel]);

  useKeyboard(
    {
      onKeyDown(event: KeyboardEvent) {
        const element = document.activeElement;
        if (element && element.id) {
          return false;
        }
        function selectPreviousThread() {
          const index = threadsToRender.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index > 0) {
            const threadId = threadsToRender[index - 1].id;
            setCurrentThreadId(threadId);
          }
        }

        function selectNextThread() {
          const index = threadsToRender.findIndex(
            (thread) => thread.id === currentThreadId
          );
          if (index < threadsToRender.length - 1) {
            const threadId = threadsToRender[index + 1].id;
            setCurrentThreadId(threadId);
          }
        }

        if (currentThreadId && event.key === 'ArrowUp') {
          selectPreviousThread();
        } else if (currentThreadId && event.key === 'ArrowDown') {
          selectNextThread();
        } else if (currentThreadId && event.shiftKey && event.key === 'E') {
          const userThreadStatus = userThreadStatuses.find(
            (status) => status.threadId === currentThreadId
          );
          if (userThreadStatus?.read) {
            markUserThreadStatuses(currentThreadId, {
              muted: false,
              read: false,
            });
            selectPreviousThread();
          }
        } else if (currentThreadId && event.key === 'e') {
          const userThreadStatus = userThreadStatuses.find(
            (status) => status.threadId === currentThreadId
          );
          if (!userThreadStatus || !userThreadStatus?.read) {
            markUserThreadStatuses(currentThreadId, {
              muted: false,
              read: true,
            });
            selectPreviousThread();
          }
        } else if (currentThreadId && event.shiftKey && event.key === 'M') {
          const userThreadStatus = userThreadStatuses.find(
            (status) => status.threadId === currentThreadId
          );
          if (!userThreadStatus || userThreadStatus?.muted) {
            markUserThreadStatuses(currentThreadId, {
              muted: false,
              read: false,
            });
            selectPreviousThread();
          }
        } else if (currentThreadId && event.key === 'm') {
          const userThreadStatus = userThreadStatuses.find(
            (status) => status.threadId === currentThreadId
          );
          if (!userThreadStatus || !userThreadStatus?.muted) {
            markUserThreadStatuses(currentThreadId, {
              muted: true,
              read: false,
            });
            selectPreviousThread();
          }
        }
      },
    },
    [threadsToRender, userThreadStatuses, currentThreadId]
  );

  const auth = permissions.auth || null;
  const authId = auth?.id;

  function updateUserThreadStatusesOnWebsocketEvents(payload: any) {
    const threadId = payload.thread_id;
    if (!threadId) {
      return;
    }
    setUserThreadStatuses((statuses) => {
      return statuses.map((status) => {
        if (status.threadId === threadId) {
          if (
            status.muted &&
            payload.is_mention &&
            payload.user_id === authId
          ) {
            return {
              ...status,
              muted: false,
            };
          } else if (status.read) {
            return {
              ...status,
              read: false,
            };
          }
        }
        return status;
      });
    });
  }

  useWebsockets({
    room: authId && `user:${authId}`,
    permissions,
    token,
    onNewMessage: updateUserThreadStatusesOnWebsocketEvents,
  });

  useEffect(() => {
    if (currentUser && window.Notification) {
      const permission = storage.get('notification.permission');
      if (!permission) {
        window.Notification.requestPermission((permission) => {
          storage.set('notification.permission', permission);
          if (permission === 'granted') {
            Toast.info('Notifications are enabled');
            new Notification('Notifications are enabled');
          }
        });
      }
    }
  }, []);

  const onStatusChange = (status: ThreadStatus) => {
    setStatus(status);
  };

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
    setTimeout(() => {
      const node = document.getElementById('thread-message-form-textarea');
      if (node) {
        node.focus();
      }
    }, 0);
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
      .deleteMessage({ id: messageId, accountId: settings.communityId })
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
    { muted, read }: { muted: boolean; read: boolean }
  ) {
    debouncedUpserUserThreadStatus({
      communityId: currentCommunity.id,
      threadId,
      muted,
      read,
    });
    setUserThreadStatuses((statuses) => {
      const status = statuses.find((status) => status.threadId === threadId);

      if (!status) {
        return [
          ...statuses,
          {
            userId: currentUser.id,
            muted,
            read,
            threadId,
          },
        ];
      }

      return statuses.map((status) => {
        if (status.threadId === threadId) {
          return {
            ...status,
            muted,
            read,
          } as SerializedUserThreadStatus;
        }
        return status;
      });
    });
  }

  async function muteThread(threadId: string) {
    Toast.info('Thread was muted.');
    markUserThreadStatuses(threadId, { muted: true, read: false });
  }

  async function unmuteThread(threadId: string) {
    Toast.info('Thread was unmuted.');
    markUserThreadStatuses(threadId, { muted: false, read: false });
  }

  async function readThread(threadId: string) {
    Toast.info('Thread was marked as read.');
    markUserThreadStatuses(threadId, { muted: false, read: true });
  }

  async function unreadThread(threadId: string) {
    Toast.info('Thread was marked as unread.');
    markUserThreadStatuses(threadId, { muted: false, read: false });
  }

  async function pinThread(threadId: string) {
    const thread = threads.find(({ id }) => id === threadId);
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
        accountId: settings.communityId,
        id: thread.id,
        pinned: newPinned,
      })
      .catch((_) => {
        Toast.error('Failed to pin the thread.');
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
    function addReaction(threads: SerializedThread[]) {
      if (!currentUser) {
        return threads;
      }
      return threads.map((thread) => {
        if (thread.id === threadId) {
          return {
            ...thread,
            messages: thread.messages.map((message) => {
              if (message.id === messageId) {
                const reaction = message.reactions.find(
                  (reaction) => reaction.type === type
                );
                if (!reaction) {
                  return {
                    ...message,
                    reactions: [
                      ...message.reactions,
                      { type, count: 1, users: [currentUser] },
                    ],
                  };
                }

                if (active) {
                  return {
                    ...message,
                    reactions: message.reactions
                      .filter((reaction) => {
                        if (
                          reaction.type === type &&
                          reaction.count - 1 === 0
                        ) {
                          return false;
                        }
                        return true;
                      })
                      .map((reaction) => {
                        if (reaction.type === type) {
                          const count = reaction.count - 1;
                          return {
                            type,
                            count,
                            users: reaction.users.filter(
                              ({ id }) => id !== currentUser.id
                            ),
                          };
                        }
                        return reaction;
                      }),
                  };
                }

                return {
                  ...message,
                  reactions: message.reactions.map((reaction) => {
                    if (reaction.type === type) {
                      return {
                        type,
                        count: reaction.count + 1,
                        users: [...reaction.users, currentUser],
                      };
                    }
                    return reaction;
                  }),
                };
              }
              return message;
            }),
          };
        }
        return thread;
      });
    }
    setThreads(addReaction);
    setPinnedThreads(addReaction);
    postReaction({
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
    return mergeThreadsRequest({
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

    return moveMessageToThreadRequest({
      messageId,
      threadId,
      communityId: currentCommunity.id,
    });
  };

  const moveThreadToChannel = ({
    threadId,
    channelId,
  }: {
    threadId: string;
    channelId: string;
  }) => {
    setThreads((threads) => {
      return threads.filter((thread) => {
        if (thread.id === threadId && thread.channelId !== channelId) {
          return false;
        }
        return true;
      });
    });

    return moveThreadToChannelRequest({
      threadId,
      channelId,
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

    return moveMessageToChannelRequest({
      messageId,
      channelId,
      communityId: currentCommunity.id,
    }).then((thread: SerializedThread) => {
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

  function onChannelDrop({
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
    if (source === 'thread' && target === 'channel') {
      return moveThreadToChannel({ threadId: from, channelId: to });
    } else if (source === 'message' && target === 'channel') {
      return moveMessageToChannel({ messageId: from, channelId: to });
    }
  }

  function onThreadMessage(
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ) {
    setThreads((threads) => {
      return threads.map((thread) => {
        if (thread.id === currentThreadId) {
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
    <PageLayout
      currentChannel={currentChannel}
      seo={{
        ...buildChannelSeo({
          settings,
          channelName,
          isSubDomainRouting,
          pathCursor,
          threads,
        }),
      }}
      channels={channels}
      communities={communities}
      currentCommunity={currentCommunity}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      onDrop={onChannelDrop}
    >
      <Content
        key={currentChannel.channelName}
        threads={threadsToRender}
        pinnedThreads={pinnedThreads}
        currentChannel={currentChannel}
        currentCommunity={currentCommunity}
        settings={settings}
        channelName={channelName}
        isSubDomainRouting={isSubDomainRouting}
        nextCursor={nextCursor}
        pathCursor={pathCursor}
        isBot={isBot}
        permissions={permissions}
        currentThreadId={currentThreadId}
        userThreadStatuses={userThreadStatuses}
        status={status}
        onStatusChange={onStatusChange}
        setThreads={setThreads}
        deleteMessage={deleteMessage}
        muteThread={muteThread}
        unmuteThread={unmuteThread}
        pinThread={pinThread}
        readThread={readThread}
        unreadThread={unreadThread}
        onMessage={onThreadMessage}
        onDrop={onThreadDrop}
        sendReaction={sendReaction}
        onSelectThread={onSelectThread}
        updateThread={updateThread}
        onThreadMessage={onSocket}
        token={token}
      />
    </PageLayout>
  );
}
