import { Anchor, Text } from '@mantine/core';
import Avatar, { Size } from '../../Avatar';
import { AiOutlineLink } from 'react-icons/ai';
import { useMemo, useEffect } from 'react';
import { format } from 'timeago.js';
import PageLayout from '../../layout/PageLayout';
import Message from '../../Message';
import styles from './index.module.css';
import {
  MentionsWithUsers,
  ThreadByIdProp,
} from '../../../types/apiResponses/threads/[threadId]';

export default function Thread({
  threadId,
  messages,
  channels,
  currentChannel,
  slackUrl,
  slackInviteUrl,
  threadUrl,
  threadSlackInviteUrl,
  settings,
  viewCount,
  communityName,
  isSubDomainRouting,
}: ThreadByIdProp) {
  if (!threadId) {
    return <div></div>;
  }

  const elements = useMemo(() => {
    return messages
      .sort((a, b) => b.sentAt - a.sentAt)
      .map(({ body, author, id: messageId, sentAt, mentions, ...rest }) => {
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
              <Message
                mentions={mentions.map((m: MentionsWithUsers) => m.users)}
                text={body}
                author={author}
              />
            </div>
          </li>
        );
      });
  }, [messages]);

  useEffect(() => {
    fetch(`/api/threads?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  return (
    <PageLayout
      users={messages.map(({ author }) => author)}
      seo={{ title: messages[0].body.slice(0, 30) }}
      communityName={communityName}
      currentChannel={currentChannel}
      navItems={{ channels: channels }}
      slackUrl={slackUrl}
      slackInviteUrl={slackInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="py-8 px-4 md:pl-2 lg:pl-0 md:pr-20 lg:pr-40">
        <ul>{elements}</ul>

        <div className={styles.buttons}>
          <Anchor
            className={styles.join}
            href={threadSlackInviteUrl || threadUrl}
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
