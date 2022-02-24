import { Avatar, AvatarsGroup, Paper, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Table from '../../../components/table/Table';
import Message from '../../../components/Message';
import TableRow from '../../../components/table/TableRow';
import TableElement from '../../../components/table/TableElement';
import TableHeader from '../../../components/table/TableHeader';
import {
  channelIndex,
  findAccountByPath,
  findChannel,
  listUsers,
  threadIndex,
} from '../../../lib/slack';
import { useRouter } from 'next/router';
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
  foundLink: any;
};

function Channel({
  channelId,
  users,
  threads,
  channels,
  slackUrl,
  foundLink,
}: Props) {
  const channelName = channels.find((c) => c.id === channelId).channelName;

  const rows = useMemo(() => {
    return threads.map(({ messages, id: threadId }) => {
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
          <TableElement style={{ paddingRight: '60px' }}>
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
      users={users}
      slackUrl={slackUrl}
      seo={{ title: `${channelName} threads` }}
      navItems={{ channels: channels }}
      foundLink={foundLink}
    >
      <Paper
        padding="xl"
        style={{
          width: '100%',
        }}
      >
        <Title order={3}>{channelName}</Title>
        <Table clickable>
          <thead>
            <tr>
              <TableHeader>Topic</TableHeader>
              <TableHeader>Authors</TableHeader>
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
  const foundLink =
    links.find((l) => {
      return l.accountId === account.id;
    }) || links[0];
  console.log({ foundLink });

  return {
    props: {
      channelId,
      users,
      threads: threads.map((t) => ({
        ...t,
        messages: t.messages.map((m) => {
          return {
            body: m.body,
            // Have to convert to string b/c Nextjs doesn't support date hydration -
            // see: https://github.com/vercel/next.js/discussions/11498
            sentAt: m.sentAt.toString(),
            author: m.author,
          };
        }),
      })),
      channels,
      communityName,
      slackUrl: account.slackUrl,
      foundLink,
    },
  };
}
