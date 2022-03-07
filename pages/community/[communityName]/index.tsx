import { Avatar, AvatarsGroup, Paper, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Table from '../../../components/table/Table';
import Message from '../../../components/Message';
import TableRow from '../../../components/table/TableRow';
import TableElement from '../../../components/table/TableElement';
import TableHeader from '../../../components/table/TableHeader';
import { findAccountByPath, listUsers, threadIndex } from '../../../lib/slack';
import serializeThread from '../../../serializers/thread';
import { links } from '../../../constants/examples';

const EXCERPT_LENGTH = 220;

const Wrapper = styled.div({
  height: 'calc(100vh - 98px)',
  overflowY: 'auto',
});

type Props = {
  channelId: string;
  users: any[];
  channels: any[];
  threads: any[];
  slackUrl: string;
  settings: any;
};

function Channel({
  channelId,
  users,
  threads,
  channels,
  slackUrl,
  settings,
}: Props) {
  const channelName = channels.find((c) => c.id === channelId).channelName;

  const rows = useMemo(() => {
    return threads.map(({ messages, id: threadId, viewCount }) => {
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
        <div className="border-solid border-gray-200">
          <li className="px-4 py-4 hover:bg-gray-50  sm:hidden">
            <Link
              key={threadId}
              href={`/channel/${channelId}/thread/${threadId}`}
              passHref
            >
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
                <div className="flex flex-col">
                  <div className="pb-2 sm:px-6">
                    <Message users={users} text={oldestMessage.body} truncate />
                  </div>
                  <div className="hidden sm:block"></div>
                  <div className="text-sm text-gray-400 flex flex-row justify-between">
                    <p>{messages.length} Views</p>
                    {format(new Date(newestMessage.sentAt))}
                  </div>
                </div>
              </div>
            </Link>
          </li>

          <tr className="hidden sm:block">
            <td className="px-6 py-4 max-w-[360px]">
              <Link
                key={threadId}
                href={`/channel/${channelId}/thread/${threadId}`}
                passHref
              >
                <Message users={users} text={oldestMessage.body} truncate />
              </Link>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[140px]">
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
            <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[60px]">
              {viewCount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm min-w-[60px]">
              {messages.length}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {format(new Date(newestMessage.sentAt))}
            </td>
          </tr>
        </div>
      );
    });
  }, [channelId, threads, users]);

  return (
    <PageLayout
      users={users}
      slackUrl={slackUrl}
      seo={{ title: `${channelName} threads` }}
      navItems={{ channels: channels }}
      settings={settings}
    >
      <div>
        <ul className="divide-y sm:hidden">{rows}</ul>
        <table className="hidden sm:block sm:table-fixed">
          <thead>
            <tr className="flex flex-row ">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 align-left">
                Topic
              </th>
              <div className="justify-end">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 align-right">
                  Authors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">
                  Replies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 relative">
                  Activity
                </th>
              </div>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">{rows}</tbody>
        </table>
      </div>
    </PageLayout>
  );
}

export default Channel;

type Params = {
  params: {
    communityName: string;
  };
};

export async function getServerSideProps({
  params: { communityName },
}: Params) {
  const account = await findAccountByPath(communityName);
  const channels = account.channels;
  const channel = channels[0];

  const channelId = channel.id;

  const threadsPromise = threadIndex(channelId, 50);
  const usersPromise = listUsers(channel.accountId);
  const [threads, users] = await Promise.all([threadsPromise, usersPromise]);

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
      threads: threads.map(serializeThread),
      channels,
      communityName,
      slackUrl: account.slackUrl,
      settings,
    },
  };
}
