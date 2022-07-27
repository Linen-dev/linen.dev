import Avatar from '../../Avatar';
import Avatars from '../../Avatars';
import { useEffect, useState } from 'react';
import Pagination from '../../Pagination';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import { users } from '@prisma/client';
import CustomLink from '../../Link/CustomLink';
import { capitalize } from '../../../lib/util';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import CopyToClipboardLink from './CopyToClipboardLink';
import styles from './Channel.module.css';
import CustomTableRowLink from 'components/Link/CustomTableRowLink';
import { Props } from '.';

export default function Channel({
  channelId,
  users,
  threads,
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
  const [currentThreads, setCurrentThreads] = useState(threads);
  const [pageCount, setPageCount] = useState(pagination?.pageCount);
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setCurrentThreads(threads);
    setPageCount(pagination?.pageCount);
    window.scrollTo(0, 0);
  }, [threads, pagination]);

  if (!threads) {
    return <div></div>;
  }

  if (!channelId) {
    return (
      <PageLayout
        communityUrl={communityUrl}
        communityInviteUrl={communityInviteUrl}
        settings={settings}
        communityName={communityName}
        currentChannel={currentChannel}
        navItems={{ channels: channels }}
        isSubDomainRouting={isSubDomainRouting}
        seo={{
          title: `${capitalize(
            settings.name || communityName
          )} - Discover and join our community`,
          description: `Threads 404`,
        }}
      >
        <h1 className="font-bold text-blue-600 text-center text-9xl pt-6">
          404
        </h1>
        <h6 className="mb-2 text-2xl font-bold text-center text-gray-800 md:text-3xl">
          <span className="text-red-500">Oops!</span> Channel not found
        </h6>
        <p className="mb-8 text-center text-gray-500 md:text-lg">
          The channel you’re looking for doesn’t exist.
        </p>
      </PageLayout>
    );
  }

  // Todo: handle missing channels
  const channelName = channels?.find((c) => c.id === channelId)?.channelName;
  const handlePageClick = ({ selected }: { selected: number }) => {
    const newPage = selected + 1;
    if (newPage == currentPage) return;
    CustomRouterPush({
      communityType: settings.communityType,
      isSubDomainRouting,
      communityName,
      path: `/c/${currentChannel.channelName}/${newPage}`,
    });
    setCurrentPage(newPage);
  };

  const rows = currentThreads
    ?.map(({ messages, incrementId, slug, viewCount }) => {
      const linkProps = {
        isSubDomainRouting,
        communityName,
        communityType: settings.communityType,
        path: `/t/${incrementId}/${slug || 'topic'}`.toLowerCase(),
      };

      const oldestMessage = messages[messages.length - 1];

      const author = oldestMessage.author;
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
            communityType={settings.communityType}
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
                    {format(new Date(oldestMessage.sentAt))}
                  </div>
                </div>
                <div className="pb-2">
                  <Message
                    text={oldestMessage.body}
                    mentions={oldestMessage.mentions.map((m) => m.users)}
                    reactions={oldestMessage.reactions}
                    attachments={oldestMessage.attachments}
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
                    <div className="text-sm">
                      <CopyToClipboardLink {...linkProps} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CustomLink>
        </li>
      );
    })
    .reverse();

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
        title: buildTitle(settings.name || communityName, channelName, page),
        // description: `${channelName} Threads - Page ${page}`,
      }}
      navItems={{ channels: channels }}
      settings={settings}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="sm:pt-6 justify-center">
        <ul className="divide-y sm:max-w-4xl px-1">{rows}</ul>
        {!!pageCount && (
          <Pagination
            channelName={currentChannel.channelName}
            onClick={handlePageClick}
            pageCount={pageCount}
            communityName={communityName}
            isSubDomainRouting={isSubDomainRouting}
            initialPage={page ? page - 1 : 0}
            communityType={settings.communityType}
          />
        )}
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
