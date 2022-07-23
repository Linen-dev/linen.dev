import React, { useCallback, useEffect, useRef, useState } from 'react';
import PageLayout from '../../layout/PageLayout';
import { capitalize } from '../../../lib/util';
import { Props, messageWithAuthor } from '.';
import { AiOutlineLoading } from 'react-icons/ai';
import { channels } from '@prisma/client';
import { Settings } from 'services/accountSettings';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Row from '../../Message/Row';
import { fetcher } from '@/utilities/fetcher';
import JoinChannelLink from 'components/Link/JoinChannelLink';

export default function ChannelChatView({
  channelId,
  users,
  messages,
  channels,
  communityUrl,
  communityInviteUrl,
  currentChannel,
  settings,
  communityName,
  pagination,
  page,
  isSubDomainRouting,
}: Props) {
  const [currentThreads, setCurrentThreads] = useState(messages);
  const [currentPage, setCurrentPage] = useState(page);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [error, setError] = useState<Error>();
  const router = useRouter();
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>();

  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading,
    hasNextPage,
    onLoadMore: loadMore,
    disabled: !!error,
    rootMargin: '0px 0px 0px 0px',
  });

  async function loadMore() {
    setLoading(true);
    try {
      const data = await fetcher(
        `/api/messages?channelId=${channelId}&page=${currentPage + 1}`
      );
      setHasNextPage(data.length === 10);
      data.length && setCurrentPage(currentPage + 1);
      setCurrentThreads((currentThreads) => [
        ...(currentThreads ? currentThreads : []),
        ...data,
      ]);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!router.query.page) return;
    if (String(currentPage) !== router.query.page) {
      router.replace(
        router.asPath.substring(0, router.asPath.lastIndexOf('/') + 1) +
          currentPage,
        undefined,
        { shallow: true }
      );
    }
  }, [currentPage, router]);

  useEffect(() => {
    setCurrentThreads(messages);
    setHasNextPage(true);
    setCurrentPage(page);
    scrollToBottom('rootRefSetter');
  }, [messages, page]);

  // We keep the scroll position when new items are added
  useEffect(() => {
    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom =
      lastScrollDistanceToBottomRef.current ?? 0;
    if (scrollableRoot) {
      scrollableRoot.scrollTop =
        scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
    }
  }, [currentThreads, rootRef]);

  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef]
  );

  const handleRootScroll = React.useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (rootNode) {
      const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
      lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    }
  }, []);

  if (!messages || !currentThreads) {
    return <div></div>;
  }

  function onlyMessagesFromCurrentChannel(message: messageWithAuthor) {
    return message.channelId === currentChannel.id;
  }

  return (
    //Super hacky mobile friendly - different component gets
    //rendered when it is smaller than a specific size and gets unhidden
    <PageLayout
      users={users}
      communityUrl={communityUrl}
      communityInviteUrl={communityInviteUrl}
      currentChannel={currentChannel}
      seo={{
        title: buildTitle(
          settings.name || communityName,
          currentChannel.channelName,
          page
        ),
        // description: `${channelName} Threads - Page ${page}`,
      }}
      navItems={{ channels: channels }}
      settings={settings}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div
        className={classNames(
          'py-4 px-4 grid grow place-items-center overflow-auto',
          'lg:h-[calc(100vh_-_80px)] lg:w-[calc(100vw-250px)]',
          'sm:h-[calc(100vh_-_144px)]',
          'h-[calc(100vh_-_192px)] w-full'
        )}
        ref={rootRefSetter}
        onScroll={handleRootScroll}
        id="rootRefSetter"
      >
        <div className="w-full md:w-[700px] self-start">
          <ul
            role="list"
            className="divide-y divide-gray-200 flex flex-col-reverse"
          >
            {currentThreads
              .filter(onlyMessagesFromCurrentChannel)
              .map((message, index) => {
                const previousMessage = messages[index + 1];
                const nextMessage = messages[index - 1];
                const isPreviousMessageFromSameUser =
                  previousMessage &&
                  previousMessage.usersId === message.usersId;
                const isNextMessageFromSameUser =
                  nextMessage && nextMessage.usersId === message.usersId;
                return (
                  <Row
                    key={message.id}
                    message={message}
                    isPreviousMessageFromSameUser={
                      isPreviousMessageFromSameUser
                    }
                    isNextMessageFromSameUser={isNextMessageFromSameUser}
                  />
                );
              })}
            {hasNextPage && (
              <div ref={infiniteRef} className="flex justify-center p-4">
                <AiOutlineLoading className="fa-spin" />
              </div>
            )}
          </ul>
          <JoinChannelLink
            href={buildInviteLink(
              { ...settings, communityInviteUrl },
              currentChannel
            )}
            communityType={settings.communityType}
          />
        </div>
      </div>
    </PageLayout>
  );
}

function buildInviteLink(
  settings: Settings & { communityInviteUrl?: string },
  currentChannel: channels
) {
  if (!settings.communityInviteUrl) return '';
  if (settings.communityType === 'discord') {
    return `${settings.communityInviteUrl}/${currentChannel.externalChannelId}`;
  } else {
    return settings.communityInviteUrl;
  }
}

function buildTitle(
  communityName: string,
  channelName: string | undefined,
  page: number = 1
) {
  const name = capitalize(communityName);
  const channel = !!channelName ? ` - ${capitalize(channelName)} Messages` : '';
  return `${name}${channel}`;
}

const scrollToBottom = (id: string) => {
  const element = document.getElementById(id);
  if (element) element.scrollTop = element.scrollHeight;
};
