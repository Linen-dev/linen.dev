import { Avatar, AvatarsGroup, Paper, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Message from '../../../components/Message';
import { findAccountByPath, listUsers } from '../../../lib/slack';
import { links } from '../../../constants/examples';
import { channels, users } from '@prisma/client';
import { index as fetchThreads } from '../../../services/threads';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid';

interface Pagination {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  perPage: number;
}

type Props = {
  channelId: string;
  users: users[];
  channels: channels[];
  threads: any[];
  slackUrl: string;
  settings: any;
  communityName: string;
  pagination: Pagination;
  page: number;
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
        setCurrentThreads(data.threads);
        setPageCount(pagination.pageCount);
        window.scrollTo(0, 0);
      });
  }, [currentPage]);

  const handlePageClick = ({ selected }) => {
    const newPage = selected + 1;
    window.history.pushState({}, null, `?page=${newPage}`);
    setCurrentPage(newPage);
  };

  const rows = currentThreads.map(({ messages, id: threadId, viewCount }) => {
    const oldestMessage = messages[messages.length - 1];
    const newestMessage = messages[0];
    const participants = messages.reduce((agg, { author }) => {
      if (
        author &&
        !agg.find((a) => a.profileImageUrl === author.profileImageUrl)
      ) {
        agg.push(author);
      }
      return agg;
    }, []);
    const author = participants[0];


    
    return (
      <div key={threadId} className="border-solid border-gray-200">
        <li className="px-4 py-4 hover:bg-gray-50  sm:hidden cursor-pointer">
          <Link href={`/channel/${channelId}/thread/${threadId}`} passHref>
            <div className="flex">
              <div className="flex pr-4 items-center sm:hidden">
                <Avatar
                  radius="xl"
                  key={author?.id || author?.displayName}
                  color="indigo"
                  src={author?.profileImageUrl} // set placeholder with a U sign
                  alt={author?.displayName} // Set placeholder of a slack user if missing
                >
                  <Text style={{ marginTop: '-2px', fontSize: '14px' }}>
                    {(author?.displayName || '?').slice(0, 1).toLowerCase()}
                  </Text>
                </Avatar>
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
      </div>
    );
  });

  const tableRows = currentThreads.map(
    ({ messages, id: threadId, viewCount }) => {
      const oldestMessage = messages[messages.length - 1];
      const newestMessage = messages[0];
      const participants = messages.reduce((agg, { author }) => {
        if (
          author &&
          !agg.find((a) => a.profileImageUrl === author.profileImageUrl)
        ) {
          agg.push(author);
        }
        return agg;
      }, []);
      const author = participants[0];

      return (
        <Link
          key={threadId}
          href={`/channel/${channelId}/thread/${threadId}`}
          passHref
        >
          <tr className="border-solid border-gray-200 cursor-pointer">
            <td className="px-6 py-3 md:max-w-[800px]">
              <Message users={users} text={oldestMessage.body} truncate />
            </td>
            <td className="px-6 py-3 align-middle">
              <AvatarsGroup size={36} limit={3}>
                {participants.map((p, idx) => (
                  <Avatar
                    radius="xl"
                    key={p.id || p.displayName}
                    color="indigo"
                    src={p?.profileImageUrl} // set placeholder with a U sign
                    alt={p?.displayName} // Set placeholder of a slack user if missing
                  >
                    <Text style={{ marginTop: '-2px', fontSize: '14px' }}>
                      {(p?.displayName || '?').slice(0, 1).toLowerCase()}
                    </Text>
                  </Avatar>
                ))}
              </AvatarsGroup>
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
      <div className="flex justify-center p-5 m-5">
        <ReactPaginate
          breakLabel="..."
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          containerClassName="relative z-0 inline-flex rounded-md shadow-lg -space-x-px"
          breakLinkClassName="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          hrefBuilder={(page: number) => `?page=${page}`}
          activeLinkClassName="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          pageLinkClassName="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          previousLinkClassName="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          previousLabel={
            <>
              <span className="sr-only">Previous</span>
              <ChevronLeftIcon className="h-5 w-5" />
            </>
          }
          nextLinkClassName="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          nextLabel={
            <>
              <ChevronRightIcon className="h-5 w-5" />
            </>
          }
          renderOnZeroPageCount={null}
        />
      </div>
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
  const { threads } = data;
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
