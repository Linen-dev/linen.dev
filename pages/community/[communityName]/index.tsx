import { Avatar, AvatarsGroup, Paper, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Message from '../../../components/Message';
import { findAccountByPath, listUsers, threadIndex } from '../../../lib/slack';
import serializeThread from '../../../serializers/thread';
import { links } from '../../../constants/examples';
import { channels, slackThreads, users } from '@prisma/client';

const EXCERPT_LENGTH = 220;

const Wrapper = styled.div({
  height: 'calc(100vh - 98px)',
  overflowY: 'auto',
});

type Props = {
  channelId: string;
  users: users[];
  channels: channels[];
  threads: any[];
  slackUrl: string;
  settings: any;
  communityName: string;
};

function Channel({
  channelId,
  users,
  threads,
  channels,
  slackUrl,
  settings,
  communityName,
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
        <div key={threadId} className="border-solid border-gray-200">
          <li className="px-4 py-4 hover:bg-gray-50  sm:hidden cursor-pointer">
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
                <div className="flex flex-col w-full">
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
        </div>
      );
    });
  }, [channelId, threads, users]);

  const tableRows = useMemo(() => {
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
    });
  }, [channelId, threads, users]);

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
