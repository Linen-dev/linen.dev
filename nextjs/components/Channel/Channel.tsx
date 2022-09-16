import { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Spinner from 'components/Spinner';
import { Thread } from 'components/Thread';
import { Transition } from '@headlessui/react';
import { Feed } from 'components/Feed';
import { SerializedThread } from 'serializers/thread';
import { ChannelViewProps } from 'components/Pages/ChannelsPage';
import { getData } from 'utilities/fetcher';
import MessageForm from 'components/MessageForm';
import { isChatEnabled } from 'utilities/featureFlags';
import Header from './Header';
import { ThreadState } from '@prisma/client';

export function Channel({
  threads,
  currentChannel,
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
  const [currentThreads, setCurrentThreads] = useState<SerializedThread[]>();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const lastDistanceToBottomRef = useRef<number>(0);
  const lastDistanceToTopRef = useRef<number>(60);
  const [lastDirection, setLastDirection] = useState<'top' | 'bottom'>();
  const [cursor, setCursor] = useState(nextCursor);
  const [error, setError] = useState<{ prev?: unknown; next?: unknown }>();

  const [isShowingThread, setIsShowingThread] = useState(false);
  const [currentThread, setCurrentThread] = useState<SerializedThread>();

  async function loadThread(incrementId: number) {
    const currentThread = currentThreads?.find(
      (t) => t.incrementId === incrementId
    );
    if (currentThread) {
      setCurrentThread(currentThread);
    }
    setIsShowingThread(true);
  }

  useEffect(() => {
    setCurrentThreads(threads);
  }, [threads]);

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
  }, [currentThreads]);

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
        const data = await getData('/api/threads', {
          channelId: currentChannel.id,
          cursor: cursor[key],
        });
        setCursor({ ...cursor, [key]: data?.nextCursor?.[key] });
        if (next) {
          setCurrentThreads([
            ...(currentThreads ? currentThreads : []),
            ...data.threads,
          ]);
        } else {
          setCurrentThreads([
            ...data.threads,
            ...(currentThreads ? currentThreads : []),
          ]);
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

  //choose the screen size
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  // create an event listener
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
  });

  if (!threads) {
    return <div />;
  }

  const sendMessage = async ({
    message,
    channelId,
  }: {
    message: string;
    channelId: string;
  }) => {
    return fetch(`/api/messages/channel`, {
      method: 'POST',
      body: JSON.stringify({
        body: message,
        channelId,
      }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw 'Could not send a message';
      })
      .then((thread: SerializedThread) => {
        setCurrentThreads((currentThreads) => {
          return [...(currentThreads ? currentThreads : []), thread];
        });
      });
  };

  return (
    <>
      {/* Added padding right when scroll bar is hidden 
      and remove padding when scroll bar 
      is showing so it doesn't move the screen as much */}

      <Transition
        show={showChannel({ isMobile, isShowingThread })}
        className="
        overflow-auto

        lg:h-[calc(100vh_-_80px)]
        md:h-[calc(100vh_-_144px)] 
        h-[calc(100vh_-_192px)]
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
          <ul className="divide-y">
            {cursor?.prev && !error?.prev ? (
              <div className="m-3" ref={infiniteRef}>
                <Spinner />
              </div>
            ) : (
              <div />
            )}
            <Feed
              threads={currentThreads}
              isSubDomainRouting={isSubDomainRouting}
              settings={settings}
              isBot={isBot}
              onClick={loadThread}
            />
            {isChatEnabled && permissions.chat && (
              <div className="w-full pt-4 px-4">
                <MessageForm
                  onSend={(message: string) =>
                    sendMessage({ message, channelId: currentChannel.id })
                  }
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
            <div ref={messagesEndRef} />
          </ul>
        </div>
      </Transition>

      <Transition
        show={isShowingThread}
        className="flex flex-col border-l border-solid border-gray-200 md:w-[700px]"
      >
        <div className="overflow-auto flex flex-col">
          <Header
            title={currentThread?.title}
            channelName={channelName}
            onClose={() => setIsShowingThread(false)}
            closed={currentThread?.state === ThreadState.CLOSE}
          />
          <div className="flex justify-center">
            {currentThread && (
              <Thread
                key={currentThread.id}
                id={currentThread.id}
                channelId={currentThread.channelId}
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
                onThreadUpdate={(state: ThreadState) =>
                  setCurrentThread(() => ({
                    ...currentThread,
                    state,
                  }))
                }
              />
            )}
          </div>
        </div>
      </Transition>
    </>
  );
}

export const showChannel = ({
  isMobile,
  isShowingThread,
}: {
  isMobile: boolean;
  isShowingThread: boolean;
}): boolean => {
  if (isMobile && isShowingThread) {
    return false;
  }
  return true;
};
