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
  slackUrl,
  slackInviteUrl,
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
  // const [initial, setInitial] = useState(true);

  useEffect(() => {
    setCurrentThreads(threads);
    setPageCount(pagination?.pageCount);
    window.scrollTo(0, 0);
  }, [threads, pagination]);

  if (!threads) {
    return <div></div>;
  }

  // useEffect(() => {
  //   if (initial && channelId && page === 1) {
  //     return setInitial(false);
  //   }
  //   fetch(`/api/threads?channelId=${channelId}&page=${currentPage}`)
  //     .then((response) => response.json())
  //     .then((response) => {
  //       const { data, pagination } = response;
  //       let { threads } = data;
  //       threads = threads.filter((t: threads) => t.messages.length > 0);
  //       setCurrentThreads(threads);
  //       setPageCount(pagination.pageCount);
  //       window.scrollTo(0, 0);
  //     });
  // }, [currentPage, channelId, page]);

  if (!channelId) {
    return (
      <PageLayout
        slackUrl={slackUrl}
        slackInviteUrl={slackInviteUrl}
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

  const rows = currentThreads?.map(({ messages, incrementId, slug }) => {
    const oldestMessage = messages[messages.length - 1];
    // const newestMessage = messages[0];
    // const authors = messages.reduce((array: users[], { author }) => {
    //   if (
    //     author &&
    //     !array.find((a: users) => a.profileImageUrl === author.profileImageUrl)
    //   ) {
    //     array.push(author);
    //   }
    //   return array;
    // }, []);

    const author = oldestMessage.author;

    return (
      <li
        key={incrementId}
        className="px-4 py-4 hover:bg-gray-50 border-solid border-gray-200 md:hidden cursor-pointer"
      >
        <CustomLink
          isSubDomainRouting={isSubDomainRouting}
          communityName={communityName}
          communityType={settings.communityType}
          path={`/t/${incrementId}/${slug || 'topic'}`.toLowerCase()}
          key={`${incrementId}-desktop`}
        >
          <div className="flex">
            <div className="flex pr-4 items-center md:hidden">
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
              <div className="pb-2 md:px-6">
                <Message
                  text={oldestMessage.body}
                  truncate
                  mentions={oldestMessage.mentions.map((m) => m.users)}
                />
              </div>
              <div className="text-sm text-gray-400 flex flex-row justify-between">
                <p>{messages.length} Replies</p>
                {format(new Date(oldestMessage.sentAt))}
              </div>
            </div>
          </div>
        </CustomLink>
      </li>
    );
  });

  const tableRows = currentThreads?.map(
    ({ messages, incrementId, slug, viewCount }) => {
      const oldestMessage = messages[messages.length - 1];
      // const newestMessage = messages[0];
      const authors = messages.reduce((array: users[], { author }) => {
        if (
          author &&
          !array.find(
            ({ profileImageUrl }) => profileImageUrl === author.profileImageUrl
          )
        ) {
          array.push(author);
        }
        return array;
      }, []);
      const linkProps = {
        isSubDomainRouting,
        communityName,
        communityType: settings.communityType,
        path: `/t/${incrementId}/${slug || 'topic'}`.toLowerCase(),
      };
      return (
        <CustomTableRowLink {...linkProps} key={`${incrementId}-desktop`}>
          <tr className="border-solid border-gray-200 cursor-pointer">
            <td className={styles.td}>
              <CustomLink {...linkProps}>
                <Message
                  text={oldestMessage.body}
                  truncate
                  mentions={oldestMessage.mentions.map((m) => m.users)}
                />
              </CustomLink>
            </td>
            <td className="px-6 py-3 align-middle">
              <CustomLink {...linkProps}>
                {' '}
                <Avatars
                  users={
                    authors.map((p) => ({
                      src: p.profileImageUrl,
                      alt: p.displayName,
                      text: (p.displayName || '?').slice(0, 1).toLowerCase(),
                    })) || []
                  }
                />
              </CustomLink>
            </td>
            <td className="px-6 py-3 text-sm align-middle">
              <CustomLink {...linkProps}>{viewCount}</CustomLink>
            </td>
            <td className="px-6 py-3 text-sm align-middle">
              <CustomLink {...linkProps}>{messages.length}</CustomLink>
            </td>
            <td className="px-6 py-3 text-sm align-middle min-w-[120px]">
              <CustomLink {...linkProps}>
                {format(new Date(oldestMessage.sentAt))}
              </CustomLink>
            </td>
            <td className="px-6 text-sm text-center align-middle">
              <CopyToClipboardLink {...linkProps} />
            </td>
          </tr>
        </CustomTableRowLink>
      );
    }
  );

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
    //Super hacky mobile friendly - different component gets
    //rendered when it is smaller than a specific size and gets unhidden
    <PageLayout
      users={users}
      slackUrl={slackUrl}
      slackInviteUrl={slackInviteUrl}
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
      <div className="sm:pt-6">
        <table className="hidden md:block md:table-fixed pb-6">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500">
                Topic
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Authors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Replies
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                Activity
              </th>
              <th className="px-6 text-center text-xs font-medium text-gray-500">
                Share
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">{tableRows}</tbody>
        </table>
        <ul className="divide-y md:hidden">{rows}</ul>
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
