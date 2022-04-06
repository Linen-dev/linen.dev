import Avatar from '../../Avatar';
import Avatars from '../../Avatars';
import { useEffect, useState } from 'react';
import Pagination from '../../Pagination';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import { channels, slackThreads, users, messages } from '@prisma/client';
import CustomLink from '../../Link/CustomLink';

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
}
interface threads extends slackThreads {
  messages: message[];
}
type Props = {
  slackUrl: string;
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
  const [currentThreads, setCurrentThreads] = useState(threads);
  const [pageCount, setPageCount] = useState(pagination?.pageCount);
  const [currentPage, setCurrentPage] = useState(page);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (initial && channelId) {
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
  }, [currentPage, channelId]);

  if (!channelId) {
    return (
      <PageLayout
        slackUrl={slackUrl}
        settings={settings}
        communityName={communityName}
        currentChannel={currentChannel}
        navItems={{ channels: channels }}
        isSubDomainRouting={isSubDomainRouting}
        seo={{
          title: `${communityName} questions`,
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
    window.history.pushState(
      {},
      '',
      `/c/${currentChannel.channelName}/${newPage}`
    );
    setCurrentPage(newPage);
  };

  const rows = currentThreads?.map(({ messages, incrementId, slug }) => {
    const oldestMessage = messages[messages.length - 1];
    const newestMessage = messages[0];
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
        className="px-4 py-4 hover:bg-gray-50 border-solid border-gray-200 sm:hidden cursor-pointer"
      >
        <CustomLink
          isSubDomainRouting={isSubDomainRouting}
          communityName={communityName}
          path={`/t/${incrementId}/${slug || 'topic'}`}
          key={`${incrementId}-desktop`}
        >
          <div className="flex">
            <div className="flex pr-4 items-center sm:hidden">
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
              <div className="pb-2 sm:px-6">
                <Message
                  author={oldestMessage.author}
                  text={oldestMessage.body}
                  truncate
                />
              </div>
              <div className="text-sm text-gray-400 flex flex-row justify-between">
                <p>{messages.length} Replies</p>
                {format(new Date(newestMessage.sentAt))}
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
      const newestMessage = messages[0];
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
      return (
        <CustomLink
          isSubDomainRouting={isSubDomainRouting}
          communityName={communityName}
          path={`/t/${incrementId}/${slug || 'topic'}`}
          key={`${incrementId}-desktop`}
        >
          <tr className="border-solid border-gray-200 cursor-pointer">
            <td className="px-6 py-3 md:max-w-[800px]">
              <Message
                author={oldestMessage.author}
                text={oldestMessage.body}
                truncate
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
            <td className="px-6 py-3 text-sm">{viewCount}</td>
            <td className="px-6 py-3 text-sm">{messages.length}</td>
            <td className="px-6 py-3 text-sm min-w-[120px]">
              {format(new Date(newestMessage.sentAt))}
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
      currentChannel={currentChannel}
      seo={{
        title: `${communityName} questions`,
        description: `${channelName} threads`,
      }}
      navItems={{ channels: channels }}
      settings={settings}
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="sm:pt-8 sm:px-8 sm:flex sm:justify-center">
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
            </tr>
          </thead>
          <tbody className="divide-y">{tableRows}</tbody>
        </table>
        <ul className="divide-y sm:hidden">{rows}</ul>
      </div>
      {pageCount && (
        <Pagination onClick={handlePageClick} pageCount={pageCount} />
      )}
    </PageLayout>
  );
}
