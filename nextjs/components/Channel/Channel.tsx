import { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Spinner from 'components/Spinner';
import { Thread } from 'components/Thread';
import { Transition } from '@headlessui/react';
import { Feed } from 'components/Feed';
import { SerializedThread } from 'serializers/thread';
import { ChannelViewProps } from 'components/Pages/ChannelsPage';
import { get } from 'utilities/http';
import MessageForm from 'components/MessageForm';
import { fetchMentions } from 'components/MessageForm/api';
import { ThreadState, Roles, MessageFormat } from '@prisma/client';
import { Channel as PhoneixChannel, Socket } from 'phoenix';
import type { PushMessageType } from 'services/push';
import { scrollToBottom } from 'utilities/scroll';
import styles from './index.module.css';
import { v4 as uuid } from 'uuid';
import debounce from 'awesome-debounce-promise';
import { useUsersContext } from 'contexts/Users';

const debouncedSendMessage = debounce(
  ({ message, channelId, imitationId }) => {
    return fetch(`/api/messages/channel`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        channelId,
        imitationId,
      }),
    });
  },
  100,
  { leading: true }
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

  const [channel, setChannel] = useState<PhoneixChannel>();

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

  useEffect(() => {
    if (permissions.chat) {
      //Set url instead of hard coding
      const socket = new Socket(
        `${process.env.NEXT_PUBLIC_PUSH_SERVICE_URL}/socket`
      );

      socket.connect();
      const channel = socket.channel(`room:lobby:${currentChannel.id}`, {});

      setChannel(channel);
      channel
        .join()
        .receive('ok', (resp: any) => {
          console.log('Joined successfully', resp);
        })
        .receive('error', (resp: any) => {
          console.log('Unable to join', resp);
        });
      channel.on('new_msg', (payload: PushMessageType) => {
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
          console.log(e);
        }
      });

      scrollToBottom(scrollableRootRef.current as HTMLElement);

      return () => {
        socket.disconnect();
      };
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

  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
    return debouncedSendMessage({
      message,
      channelId,
      imitationId: imitation.id,
    })
      .then((response) => {
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

  return (
    <>
      {/* Added padding right when scroll bar is hidden 
      and remove padding when scroll bar 
      is showing so it doesn't move the screen as much */}

      <Transition
        show={showChannel({ isMobile, showThread })}
        className="
        overflow-auto
        lg:h-[calc(100vh_-_64px)]
        md:h-[calc(100vh_-_144px)] 
        h-[calc(100vh_-_152px)]
        lg:w-[calc(100vw_-_250px)]
        flex justify-left
        w-[100vw]
        relative
        "
        ref={rootRefSetter}
        onScroll={handleRootScroll}
        id="rootRefSetter"
      >
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
                  return sendMessage({ message, channelId: currentChannel.id });
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
      </Transition>

      <Transition
        show={showThread}
        className="flex flex-col border-l border-solid border-gray-200 md:w-[700px]"
      >
        <div className="overflow-auto flex flex-col relative" ref={threadRef}>
          {currentThread && (
            <Thread
              key={currentThread.id}
              id={currentThread.id}
              channelId={currentThread.channelId}
              channelName={channelName}
              currentUser={currentUser}
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
              onThreadUpdate={({ state, title }) =>
                setCurrentThread(() => ({
                  ...currentThread,
                  state,
                  title,
                }))
              }
              onClose={() => setShowThread(false)}
              onSend={() => {
                scrollToBottom(threadRef.current as HTMLElement);
              }}
              onMount={() => {
                scrollToBottom(threadRef.current as HTMLElement);
              }}
            />
          )}
        </div>
      </Transition>
    </>
  );
}

const showChannel = ({
  isMobile,
  showThread,
}: {
  isMobile: boolean;
  showThread: boolean;
}): boolean => {
  if (isMobile && showThread) {
    return false;
  }
  return true;
};
