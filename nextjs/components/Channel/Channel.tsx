import { useCallback, useEffect, useRef, useState } from 'react';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Spinner from 'components/Spinner';
import CustomLinkHelper from 'components/Link/CustomLinkHelper';
import ButtonPagination from 'components/ButtonPagination';
import { Thread } from 'components/Thread';
import { Transition } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { Feed } from 'components/Feed';
import { AiOutlineLeft } from 'react-icons/ai';
import { SerializedThread } from 'serializers/thread';
import {
  ChannelViewCursorProps,
  ChannelViewProps,
} from 'components/Pages/ChannelsPage';
import { getData } from 'utilities/fetcher';

export function Channel({
  threads,
  currentChannel,
  settings,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
  isBot,
}: ChannelViewProps) {
  const [currentThreads, setCurrentThreads] = useState<SerializedThread[]>();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cursor, setCursor] = useState<ChannelViewCursorProps>();
  const [error, setError] = useState<unknown>();
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>();

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
    setCursor(nextCursor);
  }, [nextCursor]);

  useEffect(() => {
    setCurrentThreads(threads);
  }, [threads]);

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: isLoading,
    hasNextPage: !!cursor?.prev,
    onLoadMore: loadMore,
    disabled: !!error || !cursor?.prev,
    rootMargin: '400px 0px 0px 0px',
  });

  useEffect(() => {
    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom =
      lastScrollDistanceToBottomRef.current ?? 0;
    if (!hasPathCursor(pathCursor) && scrollableRoot) {
      scrollableRoot.scrollTop =
        scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
    }
  }, [currentThreads, pathCursor, rootRef]);

  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef]
  );

  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    }
  }, []);

  if (!threads) {
    return <div />;
  }

  async function loadMore() {
    if (isLoading) return;
    if (!cursor?.prev) return;
    try {
      setIsLoading(true);
      if (cursor.prev) {
        const data = await getData('/api/threads', {
          channelId: currentChannel.id,
          cursor: cursor.prev,
        });
        setCursor(data.nextCursor || null);
        setCurrentThreads([
          ...data.threads,
          ...(currentThreads ? currentThreads : []),
        ]);
      }
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <>
      {/* Added padding right when scroll bar is hidden 
      and remove padding when scroll bar 
      is showing so it doesn't move the screen as much */}
      <Transition
        show={showChannel({ isMobile, isShowingThread })}
        className="

        overflow-hidden
        hover:overflow-auto

        pr-4
        hover:pr-0

        lg:h-[calc(100vh_-_80px)]
        md:h-[calc(100vh_-_144px)] 
        h-[calc(100vh_-_192px)]
        lg:w-[calc(100vw_-_250px)]
        flex justify-center
        w-[100vw]
        "
        ref={rootRefSetter}
        onScroll={handleRootScroll}
        id="rootRefSetter"
      >
        <div className="sm:pt-6 justify-center">
          <ul className="divide-y sm:max-w-4xl px-1">
            {!hasPathCursor(pathCursor) && (
              <>
                {cursor?.prev ? (
                  <div className="m-3" ref={infiniteRef}>
                    <Spinner />
                  </div>
                ) : (
                  <div></div>
                  // Commenting this out because most of the time it isn't true and it
                  // looks buggy and unpolished
                  // <div className="text-gray-600 text-xs text-center m-3">
                  //   This is the beginning of the #{channelName} channel
                  // </div>
                )}
              </>
            )}
            <Feed
              threads={currentThreads}
              isSubDomainRouting={isSubDomainRouting}
              communityName={settings.communityName}
              communityType={settings.communityType}
              isBot={isBot}
              onClick={loadThread}
            />
            {hasPathCursor(pathCursor) && (
              <div className="text-center p-4">
                {nextCursor?.prev && (
                  <ButtonPagination
                    href={CustomLinkHelper({
                      isSubDomainRouting,
                      communityName: settings.communityName,
                      communityType: settings.communityType,
                      path: `/c/${channelName}/${nextCursor.prev}`,
                    })}
                    label="Previous"
                  />
                )}
                {nextCursor?.next && (
                  <ButtonPagination
                    href={CustomLinkHelper({
                      isSubDomainRouting,
                      communityName: settings.communityName,
                      communityType: settings.communityType,
                      path: `/c/${channelName}/${nextCursor.next}`,
                    })}
                    label="Next"
                    className="ml-3"
                  />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </ul>
        </div>
      </Transition>

      <Transition
        show={isShowingThread}
        className="flex flex-col border-l border-solid border-gray-200"
      >
        <div className="overflow-auto flex flex-col px-4">
          <div className="border-b border-solid border-gray-200 py-4 px-4">
            <div className="flex flex-row justify-between">
              <div className="flex flex-row justify-center">
                <div className="flex items-center md:hidden">
                  <a onClick={() => setIsShowingThread(false)}>
                    {/* Using react icon here because the thin version of FontAwesome is paid */}
                    <AiOutlineLeft color="gray" />
                  </a>
                </div>
                <p className="font-bold pl-2">{channelName}</p>
              </div>
              <a
                onClick={() => setIsShowingThread(false)}
                className="hidden md:flex md:justify-center"
              >
                <div className="min-w-[10px] flex justify-center">
                  <FontAwesomeIcon icon={faX} color="gray" />
                </div>
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <Thread
              messages={currentThread?.messages || []}
              threadUrl={''}
              communityType={settings.communityType}
              viewCount={currentThread?.viewCount || 0}
            />
          </div>
        </div>
      </Transition>
    </>
  );
}

function hasPathCursor(pathCursor?: string | null) {
  return !!pathCursor;
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
