import Avatar from '../../../components/Avatar';
import Avatars from '../../../components/Avatars';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Pagination from '../../../components/Pagination';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Message from '../../../components/Message';
import { findAccountByPath, listUsers } from '../../../lib/models';
import { links } from '../../../constants/examples';
import { channels, slackThreads, users, messages } from '@prisma/client';
import { index as fetchThreads } from '../../../services/threads';

interface PaginationType {
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
  users?: users[];
  channels?: channels[];
  threads?: threads[];
  pagination?: PaginationType;
  page?: number;
};

function Channel({
  channelId,
  users,
  threads,
  channels,
  slackUrl,
  settings,
  communityName,
  pagination,
  page,
}: Props) {
  if (!channelId) {
    return (
      <PageLayout
        slackUrl={slackUrl}
        settings={settings}
        communityName={communityName}
        navItems={{ channels: channels }}
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
  const channelName = channels.find((c) => c.id === channelId).channelName;
  const [currentThreads, setCurrentThreads] = useState(threads);
  const [pageCount, setPageCount] = useState(pagination.pageCount);
  const [currentPage, setCurrentPage] = useState(page);
  const [initial, setInitial] = useState(true);

  useEffect(() => {
    if (initial) {
      return setInitial(false);
    }
    fetch(`/api/threads?channelId=${channelId}&page=${currentPage}`)
      .then((response) => response.json())
      .then((response) => {
        const { data, pagination } = response;
        let { threads } = data;
        threads = threads.filter((t) => t.messages.length > 0);
        setCurrentThreads(threads);
        setPageCount(pagination.pageCount);
        window.scrollTo(0, 0);
      });
  }, [currentPage, channelId]);

  const handlePageClick = ({ selected }) => {
    const newPage = selected + 1;
    window.history.pushState({}, null, `?page=${newPage}`);
    setCurrentPage(newPage);
  };

  const rows = currentThreads.map(
    ({ messages, incrementId, slug, viewCount }) => {
      const oldestMessage = messages[messages.length - 1];
      const newestMessage = messages[0];
      const authors = messages.reduce((array, { author }) => {
        if (
          author &&
          !array.find((a) => a.profileImageUrl === author.profileImageUrl)
        ) {
          array.push(author);
        }
        return array;
      }, []);
      const author = authors[0];

      return (
        <li
          key={incrementId}
          className="px-4 py-4 hover:bg-gray-50 border-solid border-gray-200 sm:hidden cursor-pointer"
        >
          <Link href={`/t/${incrementId}/${slug || 'topic'}`} passHref>
            <div className="flex">
              <div className="flex pr-4 items-center sm:hidden">
                {author && (
                  <Avatar
                    key={`${incrementId}-${
                      author.id || author.displayName
                    }-avatar-mobile}`}
                    src={author.profileImageUrl} // set placeholder with a U sign
                    alt={author.displayName} // Set placeholder of a slack user if missing
                    text={(author.displayName || '?').slice(0, 1).toLowerCase()}
                  />
                )}
              </div>
              <div className="flex flex-col w-full">
                <div className="pb-2 sm:px-6">
                  <Message users={users} text={oldestMessage.body} truncate />
                </div>
                <div className="text-sm text-gray-400 flex flex-row justify-between">
                  <p>{messages.length} Replies</p>
                  {format(new Date(newestMessage.sentAt))}
                </div>
              </div>
            </div>
          </Link>
        </li>
      );
    }
  );

  const tableRows = currentThreads.map(
    ({ messages, incrementId, slug, viewCount }) => {
      const oldestMessage = messages[messages.length - 1];
      const newestMessage = messages[0];
      const authors = messages.reduce((array, { author }) => {
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
        <Link
          key={`${incrementId}-desktop`}
          href={`/t/${incrementId}/${slug || 'topic'}`}
          passHref
        >
          <tr className="border-solid border-gray-200 cursor-pointer">
            <td className="px-6 py-3 md:max-w-[800px]">
              <Message users={users} text={oldestMessage.body} truncate />
            </td>
            <td className="px-6 py-3 align-middle">
              <Avatars
                users={authors.map((p) => ({
                  src: p.profileImageUrl,
                  alt: p.displayNam,
                  text: (p.displayName || '?').slice(0, 1).toLowerCase(),
                }))}
              />
            </td>
            <td className="px-6 py-3 text-sm">{viewCount}</td>
            <td className="px-6 py-3 text-sm">{messages.length}</td>
            <td className="px-6 py-3 text-sm min-w-[120px]">
              {format(new Date(newestMessage.sentAt))}
            </td>
          </tr>
        </Link>
      );
    }
  );

  return (
    //Super hacky mobile friendly - different component gets
    //rendered when it is smaller than a specific size and gets unhidden
    <PageLayout
      users={users}
      slackUrl={slackUrl}
      seo={{
        title: `${communityName} questions`,
        description: `${channelName} threads`,
      }}
      navItems={{ channels: channels }}
      settings={settings}
      communityName={communityName}
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
      <Pagination onClick={handlePageClick} pageCount={pageCount} />
    </PageLayout>
  );
}

export default Channel;

type Params = {
  params: {
    communityName: string;
  };
  query: {
    page?: string;
  };
};

export async function getServerSideProps(context: Params) {
  const { params, query } = context;
  const page = Number(query.page) || 1;
  const { communityName } = params;
  const account = await findAccountByPath(communityName);
  const channels = account.channels;
  const channel = channels[0];

  const channelId = channel.id;

  const { data, pagination } = await fetchThreads({ channelId, page: 1 });
  let { threads } = data;
  threads = threads.filter((t) => t.messages.length > 0);
  const users = threads
    .map(({ messages }) => messages.map(({ author }) => author))
    .flat()
    .filter(Boolean);
  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: defaultSettings.logoUrl,
  };

  return {
    props: {
      channelId,
      users,
      channels,
      communityName,
      slackUrl: account.slackUrl,
      settings,
      threads,
      pagination,
      page,
    },
  };
}
