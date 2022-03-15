import { Anchor, Avatar, Group, Paper, Text } from '@mantine/core';
import { AiOutlineLink } from 'react-icons/ai';
import { useMemo, useEffect } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../../components/layout/PageLayout';
import Message from '../../../../components/Message';

import {
  channelIndex,
  findAccountById,
  findThreadById,
  listUsers,
} from '../../../../lib/models';
import serializeThread from '../../../../serializers/thread';
import { links } from '../../../../constants/examples';

import styles from './index.module.css';

type Props = {
  threadId: string;
  messages: any[];
  channels: any[];
  users: any[];
  slackUrl: string;
  threadUrl: string;
  settings: any;
  viewCount: number;
};

function Thread({
  threadId,
  messages,
  channels,
  users,
  slackUrl,
  threadUrl,
  settings,
  viewCount,
}: Props) {
  const elements = useMemo(() => {
    return messages
      .sort((a, b) => b.sentAt - a.sentAt)
      .map(({ body, author, id: messageId, sentAt, ...rest }) => {
        return (
          <div key={messageId} id={messageId}>
            <Group
              style={{ marginBottom: 24 }}
              direction="column"
              align="stretch"
            >
              <Group position="apart">
                <Group>
                  <Avatar
                    radius="xl"
                    alt={'kam'}
                    src={author?.profileImageUrl}
                  />
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
          </div>
        );
      });
  }, [messages, users]);

  useEffect(() => {
    fetch(`/api/threads?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  return (
    <PageLayout
      users={users}
      seo={{ title: messages[0].body.slice(0, 30) }}
      navItems={{ channels: channels }}
      slackUrl={slackUrl}
      settings={settings}
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

        <div className={styles.buttons}>
          <Anchor
            className={styles.join}
            href={threadUrl}
            size="sm"
            target="_blank"
          >
            <AiOutlineLink className={styles.icon} size={18} /> Join thread in
            Slack
          </Anchor>
          <div className={styles.count}>
            <span className={styles.subtext}>View count:</span> {viewCount + 1}
          </div>
        </div>
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
  const id = parseInt(threadId);
  const thread = await findThreadById(id);

  const [channels, users, account] = await Promise.all([
    channelIndex(thread.channel.accountId),
    listUsers(thread.channel.accountId),
    findAccountById(thread.channel.accountId),
  ]);

  const defaultSettings =
    links.find(({ accountId }) => accountId === account.id) || links[0];

  const settings = {
    brandColor: account.brandColor || defaultSettings.brandColor,
    homeUrl: account.homeUrl || defaultSettings.homeUrl,
    docsUrl: account.docsUrl || defaultSettings.docsUrl,
    logoUrl: defaultSettings.logoUrl,
  };

  // "https://papercups-test.slack.com/archives/C01JSB67DTJ/p1627841694000600"
  const threadUrl =
    account.slackUrl +
    '/archives/' +
    thread.channel.slackChannelId +
    '/p' +
    (parseFloat(thread.slackThreadTs) * 1000000).toString();

  return {
    props: {
      ...serializeThread(thread),
      threadId,
      users,
      channels,
      slackUrl: account.slackUrl,
      threadUrl,
      settings,
      viewCount: thread.viewCount,
    },
  };
}
