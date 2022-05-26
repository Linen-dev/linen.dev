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
import CustomLinkHelper from 'components/Link/CustomLinkHelper';

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
      .map(
        ({ body, author, id: messageId, sentAt, mentions, ...rest }, index) => {
          return (
            <li className="pb-8" key={`${messageId}-${index}`} id={messageId}>
              <div className="flex justify-between">
                <div className="flex pb-4">
                  <Avatar
                    size={Size.lg}
                    alt={author?.displayName || 'avatar'}
                    src={author?.profileImageUrl}
                    text={(author?.displayName || '?')
                      .slice(0, 1)
                      .toLowerCase()}
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
                  text={body}
                  mentions={mentions.map((m: MentionsWithUsers) => m.users)}
                />
              </div>
            </li>
          );
        }
      );
  }, [messages]);

  useEffect(() => {
    fetch(`/api/threads?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  const linkProps = {
    isSubDomainRouting,
    communityName,
    communityType: settings.communityType,
    path: `/c/${currentChannel?.channelName}`,
  };

  function buildTitle(channelName: string | undefined, message: any) {
    const channel = !!channelName ? `#${channelName}` : '';
    return `${channel} - ${message.body.slice(0, 30)}`;
  }

  return (
    <PageLayout
      users={messages.map(({ author }) => author)}
      seo={{
        title: buildTitle(currentChannel?.channelName, messages[0]),
      }}
      communityName={communityName}
      currentChannel={currentChannel}
      navItems={{ channels: channels }}
      slackUrl={slackUrl}
      slackInviteUrl={slackInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className="py-8 px-4">
        <ul>{elements}</ul>

        <div className="gap-8 columns-2">
          <div className={styles.buttons}>
            <Anchor
              className={styles.join}
              href={threadSlackInviteUrl || threadUrl}
              size="sm"
              target="_blank"
            >
              <div className="flex content-center">
                <AiOutlineLink className={styles.icon} size={18} />
                {settings.communityType === 'discord' ? (
                  <div>Join thread in Discord</div>
                ) : (
                  <div>Join thread in Slack</div>
                )}
              </div>
            </Anchor>
          </div>
          <div className={styles.count}>
            <span className={styles.subtext}>View count:</span> {viewCount + 1}
          </div>
        </div>
        <div className="flex justify-center">
          <Anchor
            className={styles.join}
            size="sm"
            href={CustomLinkHelper(linkProps)}
          >
            Back to #{currentChannel?.channelName || 'channel'}
          </Anchor>
        </div>
      </div>
    </PageLayout>
  );
}
