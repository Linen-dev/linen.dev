import { Avatar, Container, Group, Paper, Text } from '@mantine/core';
import Link from 'next/link';
import { useMemo } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../../components/layout/PageLayout';
import Table from '../../../../components/table/Table';
import { threads as exampleThreads } from '../../../../constants/examples';

function Thread({ threadId, messages }) {
  const elements = useMemo(() => {
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
                <Avatar radius="xl" alt={author.name} src={author.img} />
                <Text size="sm" weight={700}>
                  {author.name}
                </Text>
              </Group>
              <Text size="sm" color="gray">
                {format(sentAt)}
              </Text>
            </Group>
            <Text size="sm">{body}</Text>
          </Group>
        );
      });
  }, [messages]);

  return (
    <PageLayout>
      {/* <Container> */}
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
      {/* </Container> */}
    </PageLayout>
  );
}

export default Thread;

export async function getServerSideProps({ params: { threadId } }) {
  // const messages = await getMessagesForThread()

  return {
    props: {
      threadId,
      messages: Array(15)
        .fill(exampleThreads[0].messages[0])
        .map((m, idx) => ({ ...m, id: `${m.id}${idx}` })),
    },
  };
}
