import { Avatar, Container, Group, Paper, Text } from '@mantine/core';
import Link from 'next/link';
import { useMemo } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../../components/layout/PageLayout';
import Message from '../../../../components/Message';
import Table from '../../../../components/table/Table';
import {
  accountId,
  threads as exampleThreads,
} from '../../../../constants/examples';
import {
  channelIndex,
  findThreadById,
  listUsers,
  threadIndex,
} from '../../../../lib/slack';

function Thread({ threadId, messages, channels, users }) {
  const elements = useMemo(() => {
    const img =
      'https://media-exp1.licdn.com/dms/image/C4E03AQHB_3pem0I_gg/profile-displayphoto-shrink_100_100/0/1542209174093?e=1650499200&v=beta&t=GMX8clmk9wSvKGvrQ4u3IDJQGHaoBz3KQQC9lw3AJuI';
    return messages
      .sort((a, b) => b.sentAt - a.sentAt)
      .map(({ body, author, id: messageId, sentAt }) => {
        return (
          <Group
            style={{ marginBottom: 24 }}
            direction="column"
            align="stretch"
            key={messageId}
          >
            <Group position="apart">
              <Group>
                <Avatar radius="xl" alt={'kam'} src={author?.profileImageUrl} />
                <Text size="sm" weight={700}>
                  {author?.displayName}
                </Text>
              </Group>
              <Text size="sm" color="gray">
                {format(new Date(sentAt))}
              </Text>
            </Group>
            <div style={{ maxWidth: '900px' }}>
              <Message text={body} users={users} />
            </div>
          </Group>
        );
      });
  }, [messages, users]);

  return (
    <PageLayout
      seo={{ title: messages[0].body.slice(0, 30) }}
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
        <Group grow direction="column">
          {elements}
        </Group>
      </Paper>
    </PageLayout>
  );
}

export default Thread;

export async function getServerSideProps({ params: { threadId } }) {
  const channels = await channelIndex(accountId);
  const thread = (await findThreadById(threadId as string)) || { messages: [] };
  const users = await listUsers(accountId);

  return {
    props: {
      threadId,
      users,
      messages: thread.messages.map((m) => {
        return {
          body: m.body,
          // Have to convert to string b/c Nextjs doesn't support date hydration -
          // see: https://github.com/vercel/next.js/discussions/11498
          sentAt: m.sentAt.toString(),
          author: m.author,
        };
      }),
      channels,
    },
  };
}
