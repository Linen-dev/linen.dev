import { Avatar, AvatarsGroup, Paper, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'timeago.js';
import PageLayout from '../../../../../components/layout/PageLayout';
import Table from '../../../../../components/table/Table';
import Message from '../../../../../components/Message';
import TableRow from '../../../../../components/table/TableRow';
import TableElement from '../../../../../components/table/TableElement';
import TableHeader from '../../../../../components/table/TableHeader';
import {
  channelIndex,
  findAccountById,
  findChannel,
  listUsers,
  threadIndex,
} from '../../../../../lib/slack';
import serializeThread from '../../../../../serializers/thread';
import { links } from '../../../../../constants/examples';

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

      return (
        <TableRow
          key={threadId}
          href={`/channel/${channelId}/thread/${threadId}`}
        >
          <TableElement style={{ paddingRight: '60px', display: 'flex' }}>
            <Message users={users} text={oldestMessage.body} truncate />
          </TableElement>
          <TableElement style={{ minWidth: '140px' }}>
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
          </TableElement>
          <TableElement style={{ minWidth: '120px' }}>{viewCount}</TableElement>
          <TableElement style={{ minWidth: '120px' }}>
            {messages.length}
          </TableElement>
          <TableElement style={{ minWidth: '120px', whiteSpace: 'nowrap' }}>
            {format(new Date(newestMessage.sentAt))}
          </TableElement>
        </TableRow>
      );
    });
  }, [channelId, threads, users]);

  return (
    <PageLayout
      slackUrl={slackUrl}
      seo={{ title: `${channelName} threads` }}
      navItems={{ channels: channels }}
      users={users}
      settings={settings}
    >
      <Paper
        padding="xl"
        style={{
          width: '100%',
        }}
      >
        <Title order={3}>{channelName}</Title>
        <Table clickable>
          <thead className="bg-gray-50" style={{ color: 'red' }}>
            <tr>
              <th style={{ padding: '20px' }}>Topic</th>
              <TableHeader>Topic</TableHeader>
              <TableHeader>Authors</TableHeader>
              <TableHeader>Views</TableHeader>
              <TableHeader>Replies</TableHeader>
              <TableHeader>Activity</TableHeader>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Paper>
    </PageLayout>
  );
}

export default Channel;

type Params = {
  params: {
    channelId: string;
    communityName: string;
  };
};

export async function getServerSideProps({
  params: { channelId, communityName },
}: Params) {
  const [channel, threads] = await Promise.all([
    findChannel(channelId),
    threadIndex(channelId, 50),
  ]);
  const [channels, users, account] = await Promise.all([
    channelIndex(channel.accountId),
    listUsers(channel.accountId),
    findAccountById(channel.accountId),
  ]);

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
