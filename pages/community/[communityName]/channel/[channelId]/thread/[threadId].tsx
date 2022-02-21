import { Anchor, Avatar, Container, Group, Paper, Text } from '@mantine/core';
import { AiOutlineLink } from 'react-icons/ai';
import { useMemo } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../../../../components/layout/PageLayout';
import Message from '../../../../../../components/Message';
import {
  channelIndex,
  findAccountById,
  findThreadById,
  listUsers,
} from '../../../../../../lib/slack';
import { useRouter } from 'next/router';

type Props = {
  threadId: string;
  messages: any[];
  channels: any[];
  users: any[];
  slackUrl: string;
};

function Thread({ threadId, messages, channels, users, slackUrl }: Props) {
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
      slackUrl={slackUrl}
    >
      <Paper
        shadow="md"
        padding="xl"
        style={{
          width: '100%',
        }}
      >
        <Group grow direction="column">
          {elements}
        </Group>
        <Anchor style={{ display: 'flex', alignItems: 'center' }} size="sm">
          <AiOutlineLink size={18} />{' '}
          <div style={{ marginLeft: '4px' }}>Join thread in Slack</div>
        </Anchor>
      </Paper>
    </PageLayout>
  );
}

export default Thread;

export async function getServerSideProps({
  params: { threadId },
}: {
  params: { threadId: string };
}) {
  const thread = await findThreadById(threadId);
  const channels = await channelIndex(thread.channel.accountId);
  const users = await listUsers(thread.channel.accountId);
  const account = await findAccountById(thread.channel.accountId);

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
      slackUrl: account.slackUrl,
    },
  };
}
