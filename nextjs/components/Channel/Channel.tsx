import { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { Thread } from 'components/Thread';
import ChannelGrid from 'components/Channel/ChannelGrid';
import { SerializedThread } from 'serializers/thread';
import { ChannelViewProps } from 'components/Pages/ChannelsPage';
import { get, post } from 'utilities/http';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { ThreadState } from '@prisma/client';
import { useUsersContext } from 'contexts/Users';
import useWebsockets from 'hooks/websockets';
import ChatLayout from 'components/layout/shared/ChatLayout';
import SidebarLayout from 'components/layout/shared/SidebarLayout';
import useThreadWebsockets from 'hooks/websockets/thread';
import Header from './Header';
import Empty from './Empty';
import classNames from 'classnames';
import PinnedThread from './PinnedThread';
import ChannelRow from './ChannelRow';
import { toast } from 'components/Toast';
import { useJoinContext } from 'contexts/Join';
import { sendThreadMessageWrapper } from './sendThreadMessageWrapper';
import { sendMessageWrapper } from './sendMessageWrapper';
import { SerializedMessage } from 'serializers/message';
import {
  scrollToBottom,
  isScrollAtBottom,
  isInViewport,
} from 'utilities/scroll';
import {
  postReaction,
  postMerge,
  moveMessage,
  moveThread,
} from './utilities/http';
import useMode, { Mode } from 'hooks/mode';
import styles from './index.module.css';

export function Channel({
  threads: initialThreads,
  pinnedThreads: initialPinnedThreads,
  currentChannel,
  currentCommunity,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
  permissions,
}: ChannelViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [pinnedThreads, setPinnedThreads] =
    useState<SerializedThread[]>(initialPinnedThreads);
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const leftBottomRef = useRef<HTMLDivElement>(null);
  const lastDistanceToBottomRef = useRef<number>(0);
  const lastDistanceToTopRef = useRef<number>(60);
  const [lastDirection, setLastDirection] = useState<'top' | 'bottom'>();
  const [cursor, setCursor] = useState(nextCursor);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();
  const { mode } = useMode();

  const [showThread, setShowThread] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string>();

  const currentUser = permissions.user || null;
  const token = permissions.token || null;

  function handleLeftScroll() {
    if (
      isScrollAtBottom(scrollableRootRef.current as HTMLElement) ||
      isInViewport(leftBottomRef.current as HTMLElement)
    ) {
      setTimeout(() => {
        scrollToBottom(scrollableRootRef.current as HTMLElement);
      }, 0);
    }
  }

  async function selectThread(incrementId: number) {
    const currentThread = threads.find((t) => t.incrementId === incrementId);
    if (currentThread) {
      setCurrentThreadId(currentThread.id);
    }
    setShowThread(true);
    handleLeftScroll();
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

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: !!cursor.prev,
    onLoadMore: loadMore,
    disabled: !!error?.prev || !cursor.prev,
    rootMargin: '800px 0px 0px 0px',
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: !!cursor.next,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !cursor.next,
    rootMargin: '0px 0px 800px 0px',
  });

  useWebsockets({
    room: `room:lobby:${currentChannel.id}`,
    token,
    permissions,
    onNewMessage(payload) {
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
    },
  });

  useEffect(() => {
    scrollToBottom(scrollableRootRef.current as HTMLElement);
  }, []);

  const leftRef = useCallback(
    (node: HTMLDivElement) => {
      bottomRootRef(node);
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef, bottomRootRef]
  );

  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastDistanceToBottomRef.current = scrollDistanceToBottom;
      lastDistanceToTopRef.current = rootNode.scrollTop;
    }
  }, []);

  async function loadMore(next: boolean = false) {
    const key = next ? 'next' : 'prev';
    const dir = next ? 'bottom' : 'top';
    if (isLoading) return;
    if (!cursor[key]) return;
    try {
      setLastDirection(dir);
      setIsLoading(true);
      if (cursor[key]) {
        const data = await get('/api/threads', {
          channelId: currentChannel.id,
          cursor: cursor[key],
        });
        setCursor({ ...cursor, [key]: data?.nextCursor?.[key] });
        if (next) {
          setThreads([...threads, ...data.threads]);
        } else {
          setThreads([...data.threads, ...threads]);
        }
      }
      const scrollableRoot = scrollableRootRef.current;
      const lastScrollDistanceToBottom = lastDistanceToBottomRef.current;
      const lastScrollDistanceToTop = lastDistanceToTopRef.current;
      if (scrollableRoot) {
        if (pathCursor) {
          scrollableRoot.scrollTop = lastDistanceToBottomRef.current;
        } else if (lastDirection === 'top') {
          scrollableRoot.scrollTop =
            scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
        } else {
          scrollableRoot.scrollTop = lastScrollDistanceToTop;
        }
      }
    } catch (err) {
      setError({ ...error, [key]: err });
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMoreNext() {
    loadMore(true);
  }

  useThreadWebsockets({
    id: currentThreadId,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
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
    },
  });

  const sendMessage = sendMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    currentChannel,
    setThreads,
    scrollableRootRef,
    currentCommunity,
    startSignUp,
  });

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
        toast.error(exception.message);
      });
  };

  const sendThreadMessage = sendThreadMessageWrapper({
    currentUser: permissions.is_member ? currentUser : null,
    allUsers,
    setThreads,
    currentThreadId,
    currentCommunity,
    startSignUp,
  });

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
    return postMerge({
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

    return moveMessage({
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

    return moveThread({
      threadId,
      channelId,
    });
  };

  const threadToRender = threads.find(
    (thread) => thread.id === currentThreadId
  );

  const pinnedThread = pinnedThreads[pinnedThreads.length - 1];

  return (
    <>
      <SidebarLayout
        mode={mode}
        left={
          <div
            className={classNames(styles.container, {
              [styles['has-chat']]: permissions.chat,
              [styles['is-empty']]: threads.length === 0,
            })}
          >
            {cursor?.prev && !error?.prev && <div ref={infiniteRef}></div>}
            <ChatLayout
              content={
                <>
                  <Header
                    className={classNames(styles.header, {
                      [styles.pinned]: !!pinnedThread,
                    })}
                    channelName={currentChannel.channelName}
                    mode={mode}
                  >
                    {pinnedThread && (
                      <PinnedThread
                        onClick={() => selectThread(pinnedThread.incrementId)}
                      >
                        <ChannelRow
                          thread={pinnedThread}
                          permissions={permissions}
                          isSubDomainRouting={isSubDomainRouting}
                          settings={settings}
                          currentUser={currentUser}
                          onPin={pinThread}
                          onReaction={sendReaction}
                        />
                      </PinnedThread>
                    )}
                  </Header>
                  {threads.length === 0 ? (
                    <Empty />
                  ) : (
                    <ul className="divide-y w-full">
                      <ChannelGrid
                        threads={threads}
                        permissions={permissions}
                        isSubDomainRouting={isSubDomainRouting}
                        settings={settings}
                        isBot={isBot}
                        mode={mode}
                        currentUser={currentUser}
                        onClick={selectThread}
                        onPin={pinThread}
                        onReaction={sendReaction}
                        onDrop={({
                          source,
                          target,
                          from,
                          to,
                        }: {
                          source: string;
                          target: string;
                          from: string;
                          to: string;
                        }) => {
                          console.log(source, target);
                          if (source === 'thread' && target === 'thread') {
                            return mergeThreads({ from, to });
                          } else if (
                            source === 'message' &&
                            target === 'thread'
                          ) {
                            return moveMessageToThread({
                              messageId: from,
                              threadId: to,
                            });
                          } else if (
                            source === 'thread' &&
                            target === 'channel'
                          ) {
                            return moveThreadToChannel({
                              threadId: from,
                              channelId: to,
                            });
                          }
                        }}
                      />
                    </ul>
                  )}
                </>
              }
              footer={
                permissions.chat && (
                  <div
                    className={classNames(styles.chat, {
                      [styles.dimmed]: mode === Mode.Drag,
                    })}
                  >
                    <MessageForm
                      onSend={(message: string) => {
                        return sendMessage({
                          message,
                          channelId: currentChannel.id,
                        });
                      }}
                      fetchMentions={(term?: string) => {
                        if (!term) return Promise.resolve([]);
                        return fetchMentions(term, settings.communityId);
                      }}
                    />
                  </div>
                )
              }
            />
            {cursor.next && !error?.next && <div ref={infiniteBottomRef}></div>}
            <div ref={leftBottomRef}></div>
          </div>
        }
        leftRef={leftRef}
        onLeftScroll={handleRootScroll}
        right={
          showThread &&
          threadToRender && (
            <Thread
              thread={threadToRender}
              key={threadToRender.id}
              channelId={threadToRender.channelId}
              channelName={channelName}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              threadUrl={null}
              permissions={permissions}
              currentUser={currentUser}
              mode={mode}
              updateThread={updateThread}
              onClose={() => setShowThread(false)}
              sendMessage={sendThreadMessage}
              onReaction={sendReaction}
              onSend={() => {
                handleLeftScroll();
                scrollToBottom(rightRef.current as HTMLElement);
              }}
              onMount={() => {
                scrollToBottom(rightRef.current as HTMLElement);
              }}
            />
          )
        }
        rightRef={rightRef}
      />
    </>
  );
}
