import { Avatar, Container, Group, Paper, Title } from '@mantine/core';
import { useMemo } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../components/layout/PageLayout';
import Table from '../../../components/table/Table';
import TableRow from '../../../components/table/TableRow';
import TableElement from '../../../components/table/TableElement';
import {
  channels,
  threads as exampleThreads,
} from '../../../constants/examples';
import TableHeader from '../../../components/table/TableHeader';
import { channelIndex, threadIndex } from '../../../lib/slack';

const EXCERPT_LENGTH = 220;

function Channel({ channelId, threads, channels }) {
  console.log({ channels });
  const channelName = channels.find((c) => c.id === channelId).name;
  const img =
    'https://media-exp1.licdn.com/dms/image/C4E03AQHB_3pem0I_gg/profile-displayphoto-shrink_100_100/0/1542209174093?e=1650499200&v=beta&t=GMX8clmk9wSvKGvrQ4u3IDJQGHaoBz3KQQC9lw3AJuI';

  const rows = useMemo(() => {
    return threads.map(({ messages, id: threadId }) => {
      const sortedMessages = messages.sort((a, b) => b.sentAt - a.sentAt);
      const oldestMessage = sortedMessages[sortedMessages.length - 1];
      const newestMessage = sortedMessages[0];
      const participants = messages
        .reduce((agg, { author }) => {
          console.log('author :>> ', author);
          // if (!agg.find((a) => a.img === author.img)) {
          agg.push(author);
          // }
          return agg;
        }, [])
        .slice(0, 5);

      const excerpt = oldestMessage.body.substr(0, 220);

      return (
        <TableRow
          key={threadId}
          href={`/channel/${channelId}/thread/${threadId}`}
        >
          <TableElement style={{ paddingRight: '40px' }}>
            {`${excerpt}${excerpt.length === 220 ? '...' : ''}`}
          </TableElement>
          <TableElement style={{ minWidth: '80px' }}>
            <Group spacing={0}>
              {participants.map((p, idx) => (
                <Avatar
                  style={{
                    marginRight: idx === participants.length - 1 ? 0 : 4,
                  }}
                  size={24}
                  radius="xl"
                  key={idx} //p.id || p.name}
                  src={img}
                  alt={'gabe'}
                />
              ))}
            </Group>
          </TableElement>
          <TableElement>{messages.length}</TableElement>
          <TableElement style={{ whiteSpace: 'nowrap' }}>
            {format(newestMessage.sentAt)}
          </TableElement>
        </TableRow>
      );
    });
  }, [channelId, threads]);

  return (
    <PageLayout seo={{ title: channelName }} navItems={{ channels: channels }}>
      {/* <Container> */}
      <Paper
        shadow="md"
        padding="xl"
        style={{
          width: '100%',
          border: '1px solid #e9ecef',
        }}
      >
        <Title order={3}>
          {channels.find((c) => c.id === channelId).name} ({rows.length})
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
      {/* </Container> */}
    </PageLayout>
  );
}

export default Channel;

export async function getServerSideProps({ params: { channelId } }) {
  // export async function getServerSideProps(channelId: string) {
  const threads = await threadIndex(channelId, 100);
  const channels = await channelIndex('00573063-2b96-4a20-a7d0-9324550035a6');

  return {
    props: {
      channelId,
      threads: threads.map((t) => ({
        ...t,
        messages: t.messages.map((m) => {
          return {
            body: m.body,
            // Have to convert to string b/c Nextjs doesn't support date hydration -
            // see: https://github.com/vercel/next.js/discussions/11498
            sentAt: m.sentAt.toString(),
            author: {
              name: 'Kam',
            },
          };
        }),
      })),
      channels,
    },
  };
}
