import { Anchor, Group, Paper, Text } from '@mantine/core';
import Avatar from '../../../../../components/Avatar';
import { AiOutlineLink } from 'react-icons/ai';
import { useMemo, useEffect } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../../../components/layout/PageLayout';
import Message from '../../../../../components/Message';

import styles from './index.module.css';
import { getThread } from '../../../../../lib/getThread';

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
                    size="lg"
                    alt={'kam'}
                    src={author?.profileImageUrl}
                    text={(author?.displayName || '?')
                      .slice(0, 1)
                      .toLowerCase()}
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
  return await getThread(threadId);
}
