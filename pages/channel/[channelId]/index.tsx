import { Avatar, AvatarsGroup, Group, Paper, Text, Title } from '@mantine/core';
import { useMemo } from 'react';
import styled from 'styled-components';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Table from '../../../components/table/Table';
import Message from '../../../components/Message';
import TableRow from '../../../components/table/TableRow';
import TableElement from '../../../components/table/TableElement';
import {
  accountId,
  channels,
  threads as exampleThreads,
} from '../../../constants/examples';
import TableHeader from '../../../components/table/TableHeader';
import { channelIndex, listUsers, threadIndex } from '../../../lib/slack';

const EXCERPT_LENGTH = 220;

const Wrapper = styled.div({
  height: 'calc(100vh - 98px)',
  overflowY: 'auto',
});

function Channel({ channelId, users, threads, channels }) {
  const channelName = channels.find((c) => c.id === channelId).channelName;
  const img =
    'https://media-exp1.licdn.com/dms/image/C4E03AQHB_3pem0I_gg/profile-displayphoto-shrink_100_100/0/1542209174093?e=1650499200&v=beta&t=GMX8clmk9wSvKGvrQ4u3IDJQGHaoBz3KQQC9lw3AJuI';

  const rows = useMemo(() => {
    return threads.map(({ messages, id: threadId }) => {
      const sortedMessages = messages.sort((a, b) => b.sentAt - a.sentAt);
      const oldestMessage = sortedMessages[sortedMessages.length - 1];
      const newestMessage = sortedMessages[0];
      const participants = messages.reduce((agg, { author }) => {
        if (!agg.find((a) => a.profileImageUrl === author.profileImageUrl)) {
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
      seo={{ title: `${channelName} threads` }}
      navItems={{ channels: channels }}
    >
      <Paper
        shadow="md"
        padding="xl"
        style={{
          width: '100%',
          border: '1px solid #e9ecef',
        }}
      >
        <Title order={3}>
          {channelName} ({rows.length})
        </Title>
        <Table clickable>
          <thead>
            <tr>
              <TableHeader>Topic</TableHeader>
              <TableHeader />
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

export async function getServerSideProps({ params: { channelId } }) {
  const threads = await threadIndex(channelId, 100);
  const channels = await channelIndex(accountId);
  const users = await listUsers(accountId);

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
    },
  };
}
