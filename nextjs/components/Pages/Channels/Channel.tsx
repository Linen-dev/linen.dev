import Avatar from '../../Avatar';
import Avatars from '../../Avatars';
import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import type { users } from '@prisma/client';
import CustomLink from '../../Link/CustomLink';
import { capitalize } from '../../../lib/util';
import { getThreadUrl } from './utilities/url';
import { ChannelViewCursorProps, ChannelViewProps } from '.';
import { SerializedThread } from '../../../serializers/thread';
import { getData } from '../../../utilities/fetcher';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import CopyToClipboardIcon from './CopyToClipboardIcon';
import Spinner from 'components/Spinner';
import CustomLinkHelper from 'components/Link/CustomLinkHelper';

export default function Channel({
  users,
  threads,
  channels,
  communityUrl,
  communityInviteUrl,
  currentChannel,
  settings,
  communityName,
  channelName,
  isSubDomainRouting,
  nextCursor,
  pathCursor,
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

  const rows = threadBuilder({
    threads: currentThreads,
    isSubDomainRouting,
    communityName,
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
      communityUrl={communityUrl}
      communityInviteUrl={communityInviteUrl}
      currentChannel={currentChannel}
      seo={{
        title: buildTitle(settings.name || communityName, channelName),
        // description: `${channelName} Threads - Page ${page}`,
      }}
      navItems={{ channels }}
      settings={settings}
      communityName={communityName}
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
            {hasPathCursor(pathCursor) && nextCursor?.prev && (
              <div className="text-gray-600 text-xs text-center m-3">
                <a
                  href={CustomLinkHelper({
                    isSubDomainRouting,
                    communityName,
                    communityType: settings.communityType,
                    path: `/c/${channelName}/${nextCursor.prev}`,
                  })}
                >
                  Previous
                </a>
              </div>
            )}
            {rows}
            {hasPathCursor(pathCursor) && nextCursor?.next && (
              <div className="text-gray-600 text-xs text-center m-3 p-4">
                <a
                  href={CustomLinkHelper({
                    isSubDomainRouting,
                    communityName,
                    communityType: settings.communityType,
                    path: `/c/${channelName}/${nextCursor.next}`,
                  })}
                >
                  Next
                </a>
              </div>
            )}
            <div ref={messagesEndRef} />
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}

function threadBuilder({
  threads,
  isSubDomainRouting,
  communityName,
  communityType,
}: {
  threads?: SerializedThread[];
  isSubDomainRouting: boolean;
  communityName: string;
  communityType: string;
}) {
  return threads?.map(
    ({ messages, incrementId, slug, viewCount }: SerializedThread) => {
      const oldestMessage = messages[messages.length - 1];

      const author = oldestMessage?.author;
      //don't include the original poster for the thread in replies
      let users = messages.map((m) => m.author).filter(Boolean) as users[];
      const authors = uniqueUsers(users.slice(0, -1));

      return (
        <li
          key={incrementId}
          className="px-4 py-4 hover:bg-gray-50 border-solid border-gray-200 cursor-pointer"
        >
          <CustomLink
            isSubDomainRouting={isSubDomainRouting}
            communityName={communityName}
            communityType={communityType}
            path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
            key={`${incrementId}-desktop`}
          >
            <div className="flex">
              <div className="flex pr-4">
                {author && (
                  <Avatar
                    key={`${incrementId}-${
                      author.id || author.displayName
                    }-avatar-mobile}`}
                    src={author.profileImageUrl || ''} // set placeholder with a U sign
                    alt={author.displayName || ''} // Set placeholder of a slack user if missing
                    text={(author.displayName || '?').slice(0, 1).toLowerCase()}
                  />
                )}
              </div>
              <div className="flex flex-col w-full">
                <div className="flex flex-row justify-between pb-2">
                  <p className="font-semibold text-sm inline-block">
                    {author?.displayName || 'user'}
                  </p>
                  <div className="text-sm text-gray-400">
                    {format(new Date(oldestMessage?.sentAt))}
                  </div>
                </div>
                <div className="pb-2">
                  <Message
                    text={oldestMessage?.body || ''}
                    mentions={oldestMessage?.mentions.map((m) => m.users)}
                    reactions={oldestMessage?.reactions}
                    attachments={oldestMessage?.attachments}
                  />
                </div>
                <div className="flex flex-row justify-between items-center pr-2">
                  <div className="text-sm text-gray-400 flex flex-row items-center">
                    <Avatars
                      users={
                        authors.map((a) => ({
                          src: a.profileImageUrl,
                          alt: a.displayName,
                          text: (a.displayName || '?')
                            .slice(0, 1)
                            .toLowerCase(),
                        })) || []
                      }
                    />
                    {messages.length > 1 && (
                      //Kam: Not sure about this blue but I wanted to add some color to make the page more interesting
                      <div className="pl-2 text-blue-800">
                        {messages.length - 1} replies
                      </div>
                    )}
                    {/* <div className="pl-2">{viewCount} Views</div> */}
                  </div>
                  {messages.length > 1 && (
                    <CopyToClipboardIcon
                      getText={() =>
                        getThreadUrl({
                          isSubDomainRouting,
                          communityName,
                          communityType,
                          incrementId,
                          slug,
                        })
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </CustomLink>
        </li>
      );
    }
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
