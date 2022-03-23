import { Anchor, Text } from '@mantine/core';
import Avatar, { Size } from '../../../../../components/Avatar';
import { AiOutlineLink } from 'react-icons/ai';
import { useMemo, useEffect } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../../../../components/layout/PageLayout';
import Message from '../../../../../components/Message';

import styles from './index.module.css';
import { getThreadById } from '../../../../../services/threads';

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
          <li className="pb-8" key={messageId} id={messageId}>
            <div className="flex justify-between">
              <div className="flex pb-4">
                <Avatar
                  size={Size.lg}
                  alt={author?.displayName || 'avatar'}
                  src={author?.profileImageUrl}
                  text={(author?.displayName || '?').slice(0, 1).toLowerCase()}
                />
                <div className="pl-3">
                  <p className="font-semibold text-sm inline-block">
                    {author?.displayName}
                  </p>
                </div>
              </div>
              <Text size="sm" color="gray">
                {format(new Date(sentAt))}
              </Text>
            </div>
            <div style={{ maxWidth: '700px' }}>
              <Message text={body} users={users} />
            </div>
          </li>
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
      <div className="px-10 py-8 shadow-md">
        <ul>{elements}</ul>

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
      </div>
    </PageLayout>
  );
}

export default Thread;

export async function getServerSideProps({
  params: { threadId },
}: {
  params: { threadId: string };
}) {
  return await getThreadById(threadId);
}
