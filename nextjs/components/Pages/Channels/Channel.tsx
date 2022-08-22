import { useCallback, useEffect, useRef, useState } from 'react';
import PageLayout from '../../layout/PageLayout';
import type { users } from '@prisma/client';
import { capitalize } from '../../../lib/util';
import { ChannelViewCursorProps, ChannelViewProps } from '.';
import { SerializedThread } from '../../../serializers/thread';
import { getData } from '../../../utilities/fetcher';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Spinner from 'components/Spinner';
import CustomLinkHelper from 'components/Link/CustomLinkHelper';
import ButtonPagination from 'components/ButtonPagination';
import { Feed } from '../../Feed/Feed';

export default function Channel({
  users,
  threads,
  channels,
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

  const rows = Feed({
    threads: currentThreads,
    isSubDomainRouting,
    communityName: settings.communityName,
    communityType: settings.communityType,
  });

  function buildTitle(
    communityName: string,
    channelName: string | undefined,
    page: number = 1
  ) {
    const name = capitalize(communityName);
    const channel = !!channelName
      ? ` - ${capitalize(channelName)} Threads - Page ${page}`
      : '';
    return `${name}${channel}`;
  }

  return (
    <PageLayout
      users={users}
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
      currentChannel={currentChannel}
      seo={{
        title: buildTitle(settings.name || settings.communityName, channelName),
        // description: `${channelName} Threads - Page ${page}`,
      }}
      navItems={{ channels }}
      settings={settings}
      communityName={settings.communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div
        className="overflow-auto
        lg:h-[calc(100vh_-_80px)]
        md:h-[calc(100vh_-_144px)] 
        h-[calc(100vh_-_192px)]
        lg:w-[calc(100vw_-_250px)]
        flex justify-center
        w-[100vw]"
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
            {rows}
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
      </div>
    </PageLayout>
  );
}

export const uniqueUsers = (users: users[]): users[] => {
  let userMap = new Map<string, users>();

  users.forEach((user) => {
    userMap.set(user.id, user);
  });

  return Array.from(userMap.values());
};

function hasPathCursor(pathCursor?: string | null) {
  return !!pathCursor;
}
