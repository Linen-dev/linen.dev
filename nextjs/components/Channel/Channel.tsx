import { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Spinner from 'components/Spinner';
import { Thread } from 'components/Thread';
import { Feed } from 'components/Feed';
import { SerializedThread } from 'serializers/thread';
import { ChannelViewProps } from 'components/Pages/ChannelsPage';
import { get } from 'utilities/http';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { ThreadState, Roles, MessageFormat } from '@prisma/client';
import { scrollToBottom } from 'utilities/scroll';
import styles from './index.module.css';
import { v4 as uuid } from 'uuid';
import debounce from 'utilities/debounce';
import { useUsersContext } from 'contexts/Users';
import { NotifyMentions } from 'components/Notification';
import useWebsockets from 'hooks/websockets';
import { SerializedMessage } from 'serializers/message';
import SidebarLayout from 'components/layout/shared/SidebarLayout';
import useThreadWebsockets from 'hooks/websockets/thread';

const debouncedSendChannelMessage = debounce(
  ({ message, channelId, imitationId }: any) => {
    return fetch(`/api/messages/channel`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        channelId,
        imitationId,
      }),
    });
  },
  100
);

const debouncedSendMessage = debounce(
  ({ message, channelId, threadId, imitationId }: any) => {
    return fetch(`/api/messages/thread`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        channelId,
        threadId,
        imitationId,
      }),
    });
  },
  100
);

export function Channel({
  threads: initialThreads,
  currentChannel,
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
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const lastDistanceToBottomRef = useRef<number>(0);
  const lastDistanceToTopRef = useRef<number>(60);
  const [lastDirection, setLastDirection] = useState<'top' | 'bottom'>();
  const [cursor, setCursor] = useState(nextCursor);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();
  const [allUsers] = useUsersContext();

  const [showThread, setShowThread] = useState(false);
  const [currentThread, setCurrentThread] = useState<SerializedThread>();

  async function loadThread(incrementId: number) {
    const currentThread = threads.find((t) => t.incrementId === incrementId);
    if (currentThread) {
      setCurrentThread(currentThread);
    }
    setShowThread(true);
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
          fetch('/api/messages/' + messageId)
            .then((response) => response.json())
            .then((message) =>
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
              })
            );
        }

        if (payload.is_thread) {
          const threadId = payload.thread_id;
          const imitationId = payload.imitation_id;
          fetch('/api/threads/' + threadId)
            .then((response) => response.json())
            .then((thread) => {
              setThreads((threads) => [
                ...threads.filter(
                  ({ id }) => id !== imitationId && id !== threadId
                ),
                thread,
              ]);
            });
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
    id: currentThread?.id,
    token,
    permissions,
    onMessage(message, messageId, imitationId) {
      setCurrentThread((currentThread) => {
        if (!currentThread) {
          return;
        }
        return {
          ...currentThread,
          messages: [
            ...currentThread.messages.filter(
              ({ id }: any) => id !== imitationId && id !== messageId
            ),
            message,
          ],
        };
      });
    },
  });

  if (threads.length === 0) {
    return <div />;
  }

  const sendMessage = async ({
    message,
    channelId,
  }: {
    message: string;
    channelId: string;
  }) => {
    if (!currentUser) {
      throw 'current user must be present';
    }
    const imitation: SerializedThread = {
      id: uuid(),
      sentAt: new Date().toString(),
      messages: [
        {
          id: 'imitation-message-id',
          body: message,
          sentAt: new Date().toString(),
          usersId: 'imitation-user-id',
          mentions: allUsers,
          attachments: [],
          reactions: [],
          threadId: 'imitation-thread-id',
          messageFormat: MessageFormat.LINEN,
          author: {
            id: currentUser.id,
            displayName: currentUser.displayName,
            profileImageUrl: currentUser.profileImageUrl,
            externalUserId: currentUser.externalUserId,
            isBot: false,
            isAdmin: false,
            anonymousAlias: null,
            accountsId: 'imitation-account-id',
            authsId: null,
            role: Roles.MEMBER,
          },
        },
      ],
      messageCount: 1,
      channel: {
        channelName: currentChannel.channelName,
        hidden: currentChannel.hidden,
        default: currentChannel.default,
      },
      channelId: currentChannel.id,
      hidden: false,
      viewCount: 0,
      incrementId: -1,
      externalThreadId: null,
      slug: null,
      title: null,
      state: ThreadState.OPEN,
    };
    setThreads((threads: SerializedThread[]) => {
      return [...threads, imitation];
    });
    setTimeout(
      () => scrollToBottom(scrollableRootRef.current as HTMLElement),
      0
    );
    return debouncedSendChannelMessage({
      message,
      channelId,
      imitationId: imitation.id,
    })
      .then((response: any) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then(
        ({
          thread,
          imitationId,
        }: {
          thread: SerializedThread;
          imitationId: string;
        }) => {
          setThreads((threads: SerializedThread[]) => {
            const threadId = thread.id;
            let index;
            index = threads.findIndex((thread) => thread.id === threadId);
            if (index >= 0) {
              return threads;
            }
            return [
              ...threads.filter((thread) => thread.id !== imitationId),
              thread,
            ];
          });
        }
      );
  };

  const updateThread = ({
    state: newState,
    title: newTitle,
  }: {
    state?: ThreadState;
    title?: string;
  }) => {
    if (!currentThread) {
      return;
    }
    const options = {
      state: newState || currentThread.state,
      title: newTitle || currentThread.title,
    };
    setCurrentThread(() => ({
      ...currentThread,
      state: options.state,
      title: options.title,
    }));
    return fetch(`/api/threads/${currentThread.id}`, {
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
        alert(exception.message);
      });
  };

  const sendThreadMessage = async ({
    message,
    channelId,
    threadId,
  }: {
    message: string;
    channelId: string;
    threadId: string;
  }) => {
    if (!currentUser) {
      throw 'current user is required';
    }
    const imitation: SerializedMessage = {
      id: uuid(),
      body: message,
      sentAt: new Date().toString(),
      usersId: currentUser.id,
      mentions: allUsers,
      attachments: [],
      reactions: [],
      threadId,
      messageFormat: MessageFormat.LINEN,
      author: {
        id: currentUser.id,
        externalUserId: currentUser.externalUserId,
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
        isBot: false,
        isAdmin: false,
        anonymousAlias: null,
        accountsId: 'fake-account-id',
        authsId: null,
        role: Roles.MEMBER,
      },
    };

    setCurrentThread((thread) => {
      if (!thread) {
        return;
      }
      return {
        ...thread,
        messages: [...thread.messages, imitation],
      };
    });

    return debouncedSendMessage({
      message,
      channelId,
      threadId,
      imitationId: imitation.id,
    })
      .then((response: any) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then(
        ({
          message,
          imitationId,
        }: {
          message: SerializedMessage;
          imitationId: string;
        }) => {
          setCurrentThread((thread: any) => {
            if (!thread) {
              return;
            }
            const messageId = message.id;
            const index = thread.messages.findIndex(
              (message: SerializedMessage) => message.id === messageId
            );
            if (index >= 0) {
              return thread;
            }
            return {
              ...thread,
              messages: [
                ...thread.messages.filter(
                  (message: SerializedMessage) => message.id !== imitationId
                ),
                message,
              ],
            };
          });
        }
      );
  };

  return (
    <>
      <NotifyMentions token={token} key="notifyMentions" />
      <SidebarLayout
        left={
          <div className="sm:pt-6 justify-left w-full">
            {cursor?.prev && !error?.prev ? (
              <div className="m-3" ref={infiniteRef}>
                <Spinner />
              </div>
            ) : (
              <div />
            )}
            <ul className="divide-y">
              <Feed
                threads={threads}
                isSubDomainRouting={isSubDomainRouting}
                settings={settings}
                isBot={isBot}
                onClick={loadThread}
              />
            </ul>
            {permissions.chat && (
              <div className={styles.chat}>
                <MessageForm
                  onSend={(message: string) => {
                    return sendMessage({
                      message,
                      channelId: currentChannel.id,
                    });
                  }}
                  fetchMentions={fetchMentions}
                />
              </div>
            )}
            {cursor.next && !error?.next ? (
              <div className="m-3" ref={infiniteBottomRef}>
                <Spinner />
              </div>
            ) : (
              <div />
            )}
          </div>
        }
        leftRef={rootRefSetter}
        onLeftScroll={handleRootScroll}
        right={
          showThread &&
          currentThread && (
            <Thread
              key={currentThread.id}
              id={currentThread.id}
              channelId={currentThread.channelId}
              channelName={channelName}
              title={currentThread.title}
              state={currentThread.state}
              messages={currentThread.messages || []}
              viewCount={currentThread.viewCount || 0}
              settings={settings}
              isSubDomainRouting={isSubDomainRouting}
              incrementId={currentThread.incrementId}
              slug={currentThread.slug || undefined}
              threadUrl={null}
              permissions={permissions}
              updateThread={updateThread}
              onClose={() => setShowThread(false)}
              sendMessage={sendThreadMessage}
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
