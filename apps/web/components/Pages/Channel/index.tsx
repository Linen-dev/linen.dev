/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
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
  Settings,
  ThreadState,
} from '@linen/types';
import {
  postReaction,
  mergeThreadsRequest,
  moveMessageToThreadRequest,
  moveMessageToChannelRequest,
  moveThreadToChannelRequest,
} from './Content/utilities/http';
import { createThreadImitation } from './Content/utilities/thread';
import useWebsockets from '@linen/hooks/websockets';
import { useUsersContext } from '@linen/contexts/Users';
import storage from '@linen/utilities/storage'
import ChannelForBots from './ChannelForBots';

export interface ChannelProps {
  settings: Settings;
  channelName: string;
  channels: SerializedChannel[];
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount | null;
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
}

export default function Channel(props: ChannelProps) {
  if (props.isBot) {
    return <ChannelForBots {...props} />;
  }

  const {
    threads: initialThreads,
    pinnedThreads: initialPinnedThreads,
    channels,
    currentChannel: initialChannel,
    currentCommunity,
    settings,
    channelName,
    isSubDomainRouting,
    nextCursor,
    pathCursor,
    isBot,
    permissions
  } = props;

  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [pinnedThreads, setPinnedThreads] =
    useState<SerializedThread[]>(initialPinnedThreads);
  const [currentChannel, setCurrentChannel] = useState(initialChannel)
  const [currentThreadId, setCurrentThreadId] = useState<string>();
  const [allUsers] = useUsersContext();

  const currentUser = permissions.user || null;
  const token = permissions.token || null;

  useEffect(() => {
    setThreads(initialThreads);
    setCurrentThreadId(undefined);
  }, [initialThreads]);

  useEffect(() => {
    setPinnedThreads(initialPinnedThreads);
    setCurrentThreadId(undefined);
  }, [initialPinnedThreads]);

  useEffect(() => {
    setCurrentChannel(initialChannel)
  }, [initialChannel])

  useEffect(() => {
    storage.set("pages.last", { communityId: currentCommunity?.id, page: 'channel', channelId: currentChannel.id })
  }, [currentCommunity, currentChannel])

  useEffect(() => {
    if (currentUser && window.Notification) {
      const permission = storage.get('notification.permission')
      if (!permission) {
        window.Notification.requestPermission((permission) => {
          storage.set('notification.permission', permission)
          if (permission === 'granted') {
            Toast.info('Notifications are enabled')
            new Notification('Notifications are enabled')
          }
        })
      }
    }
  }, [])

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
          ...threads.filter(
            ({ id }) => id !== imitationId && id !== threadId
          ),
          thread,
        ]);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.log(e);
      }
    }
  }

  function onSelectThread(thread: SerializedThread) {
    setCurrentThreadId(thread.id);
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
    return fetch(`/api/threads/${thread.id}`, {
      method: 'PUT',
      body: JSON.stringify({ pinned: newPinned }),
    })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new Error('Failed to pin the thread.');
      })
      .catch((exception) => {
        alert(exception.message);
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
      communityId: currentCommunity?.id,
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
      communityId: currentCommunity?.id,
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
      communityId: currentCommunity?.id,
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
      communityId: currentCommunity?.id,
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
      communityId: currentCommunity?.id,
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
    return fetch(`/api/threads/${currentThreadId}`, {
      method: 'PUT',
      body: JSON.stringify(options),
    })
      .then((response) => {
        if (response.ok) {
          return;
        }
        throw new Error('Failed to close the thread.');
      })
      .catch((exception) => {
        Toast.error(exception.message);
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
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      permissions={permissions}
      onDrop={onChannelDrop}
    >
      <Content
        key={currentChannel.channelName}
        threads={threads}
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
        setThreads={setThreads}
        pinThread={pinThread}
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
