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
import { scrollToBottom } from 'utilities/scroll';
import styles from './index.module.css';
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
import debounce from 'utilities/debounce';
import { SerializedMessage } from 'serializers/message';

const debouncedSendReaction = debounce(
  (params: {
    communityId: string;
    messageId: string;
    type: string;
    action: string;
  }) => {
    return post('/api/reactions', params);
  }
);

export function Channel({
  threads: initialThreads,
  pinnedThreads: initialPinnedThreads,
  currentChannel,
  currentCommunity,
  currentUser,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
  permissions,
  token,
}: ChannelViewProps) {
  const [init, setInit] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [threads, setThreads] = useState<SerializedThread[]>(initialThreads);
  const [pinnedThreads, setPinnedThreads] =
    useState<SerializedThread[]>(initialPinnedThreads);
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const lastDistanceToBottomRef = useRef<number>(0);
  const lastDistanceToTopRef = useRef<number>(60);
  const [lastDirection, setLastDirection] = useState<'top' | 'bottom'>();
  const [cursor, setCursor] = useState(nextCursor);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [allUsers] = useUsersContext();
  const { startSignUp } = useJoinContext();

  const [showThread, setShowThread] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string>();

  async function selectThread(incrementId: number) {
    const currentThread = threads.find((t) => t.incrementId === incrementId);
    if (currentThread) {
      setCurrentThreadId(currentThread.id);
    }
    setShowThread(true);
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
    debouncedSendReaction({
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
    rootMargin: '400px 0px 0px 0px',
  });

  const [infiniteBottomRef, { rootRef: bottomRootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: !!cursor.next,
    onLoadMore: loadMoreNext,
    disabled: !!error?.next || !cursor.next,
    rootMargin: '0px 0px 400px 0px',
  });

  useEffect(() => {
    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom = lastDistanceToBottomRef.current;
    const lastScrollDistanceToTop = lastDistanceToTopRef.current;
    if (scrollableRoot) {
      if (init && pathCursor) {
        scrollableRoot.scrollTop = lastDistanceToBottomRef.current;
        setInit(false);
      } else if (lastDirection === 'top') {
        scrollableRoot.scrollTop =
          scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
      } else {
        scrollableRoot.scrollTop = lastScrollDistanceToTop;
      }
    }
  }, [threads]);

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
    if (permissions.chat && token) {
      scrollToBottom(scrollableRootRef.current as HTMLElement);
    }
  }, []);

  const rootRefSetter = useCallback(
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

  const threadToRender = threads.find(
    (thread) => thread.id === currentThreadId
  );

  const pinnedThread = pinnedThreads[pinnedThreads.length - 1];

  return (
    <>
      <SidebarLayout
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
                  <Header channelName={currentChannel.channelName}>
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
                        currentUser={currentUser}
                        onClick={selectThread}
                        onPin={pinThread}
                        onReaction={sendReaction}
                      />
                    </ul>
                  )}
                </>
              }
              footer={
                permissions.chat && (
                  <div className={styles.chat}>
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
              direction={permissions.chat ? 'end' : 'start'}
            />
            {cursor.next && !error?.next && <div ref={infiniteBottomRef}></div>}
          </div>
        }
        leftRef={rootRefSetter}
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
              updateThread={updateThread}
              onClose={() => setShowThread(false)}
              sendMessage={sendThreadMessage}
              onReaction={sendReaction}
              onSend={() => {
                scrollToBottom(threadRef.current as HTMLElement);
              }}
              onMount={() => {
                scrollToBottom(threadRef.current as HTMLElement);
              }}
            />
          )
        }
        rightRef={threadRef}
      />
    </>
  );
}
