import Avatar from '../../Avatar';
import Avatars from '../../Avatars';
import { useEffect, useState } from 'react';
import Pagination from '../../Pagination';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import { channels, slackThreads, users, messages } from '@prisma/client';
import CustomLink from '../../Link/CustomLink';
import { MentionsWithUsers } from '../../../types/apiResponses/threads/[threadId]';
import { capitalize } from '../../../lib/util';
import CustomRouterPush from 'components/Link/CustomRouterPush';
import CopyToClipboardLink from './CopyToClipboardLink';
import styles from './Channel.module.css';

export interface PaginationType {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

// The default types doesn't include associatons
// maybe look into getting prisma handle association generation
interface message extends messages {
  author: users;
  mentions: MentionsWithUsers[];
}

interface threads extends slackThreads {
  messages: message[];
}

type Props = {
  slackUrl?: string;
  slackInviteUrl?: string;
  settings: any;
  communityName: string;
  channelId?: string;
  users: users[];
  channels?: channels[];
  currentChannel: channels;
  threads?: threads[];
  pagination?: PaginationType;
  page?: number;
  isSubDomainRouting: boolean;
};
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
  if (!threads) {
    return <div></div>;
  }

  let sortedThreads: threads[] = [];
  if (threads) {
    sortedThreads = threads.sort((a, b) => {
      return (
        new Date(a.messages[0].sentAt).getTime() -
        new Date(b.messages[0].sentAt).getTime()
      );
    });
  }
  const [currentThreads, setCurrentThreads] = useState(sortedThreads);
  const [pageCount, setPageCount] = useState(pagination?.pageCount);
  const [currentPage, setCurrentPage] = useState(page);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (initial && channelId && page === 1) {
      return setInitial(false);
    }
    fetch(`/api/threads?channelId=${channelId}&page=${currentPage}`)
      .then((response) => response.json())
      .then((response) => {
        const { data, pagination } = response;
        let { threads } = data;
        threads = threads.filter((t: threads) => t.messages.length > 0);
        setCurrentThreads(threads);
        setPageCount(pagination.pageCount);
        window.scrollTo(0, 0);
      });
  }, [currentPage, channelId, page]);

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
    CustomRouterPush({
      communityType: settings.communityType,
      isSubDomainRouting,
      communityName,
      path: `/c/${currentChannel.channelName}/${newPage}`,
    });
    setCurrentPage(newPage);
  };

  const rows = currentThreads?.map(({ messages, incrementId, slug }) => {
    const newestMessage = messages[messages.length - 1];
    const oldestMessage = messages[0];
    const authors = messages.reduce((array: users[], { author }) => {
      if (
        author &&
        !array.find((a: users) => a.profileImageUrl === author.profileImageUrl)
      ) {
        array.push(author);
      }
      return array;
    }, []);

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
          path={`/t/${incrementId}/${slug || 'topic'}`}
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
                <p>{messages.length - 1} Replies</p>
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
      const newestMessage = messages[messages.length - 1];
      const oldestMessage = messages[0];
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
      const path = `/t/${incrementId}/${slug || 'topic'}`;
      return (
        <CustomLink
          isSubDomainRouting={isSubDomainRouting}
          communityName={communityName}
          communityType={settings.communityType}
          path={path}
          key={`${incrementId}-desktop`}
        >
          <tr className="border-solid border-gray-200 cursor-pointer">
            <td className={styles.td}>
              <Message
                text={oldestMessage.body}
                truncate
                mentions={oldestMessage.mentions.map((m) => m.users)}
              />
            </td>
            <td className="px-6 py-3 align-middle">
              <Avatars
                users={
                  authors.map((p) => ({
                    src: p.profileImageUrl,
                    alt: p.displayName,
                    text: (p.displayName || '?').slice(0, 1).toLowerCase(),
                  })) || []
                }
              />
            </td>
            <td className="px-6 py-3 text-sm align-middle">{viewCount}</td>
            <td className="px-6 py-3 text-sm align-middle">
              {messages.length - 1}
            </td>
            <td className="px-6 py-3 text-sm align-middle min-w-[120px]">
              {format(new Date(newestMessage.sentAt))}
            </td>
            <td className="px-6 text-sm text-center align-middle">
              <CopyToClipboardLink
                isSubDomainRouting={isSubDomainRouting}
                communityName={communityName}
                communityType={settings.communityType}
                path={path}
              />
            </td>
          </tr>
        </CustomLink>
      );
    }
  );

  return (
    //Super hacky mobile friendly - different component gets
    //rendered when it is smaller than a specific size and gets unhidden
    <PageLayout
      users={users}
      slackUrl={slackUrl}
      slackInviteUrl={slackInviteUrl}
      currentChannel={currentChannel}
      seo={{
        title: `${capitalize(
          settings.name || communityName
        )} - Discover and join our community`,
        description: `${channelName} threads`,
      }}
      navItems={{ channels: channels }}
      settings={settings}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="sm:pt-6">
        <table className="hidden sm:block sm:table-fixed ">
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
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">{tableRows}</tbody>
        </table>
        <ul className="divide-y md:hidden">{rows}</ul>
        {pageCount && (
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
