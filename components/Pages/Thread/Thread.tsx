import { Anchor } from '@mantine/core';
import { AiOutlineLink } from 'react-icons/ai';
import { useMemo, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import styles from './index.module.css';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import Row from '../../Message/Row';

export default function Thread({
  threadId,
  messages,
  channels,
  currentChannel,
  slackUrl,
  communityInviteUrl,
  threadUrl,
  threadCommunityInviteUrl,
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
      .map((message, index) => {
        const previousMessage = messages[index - 1];
        const nextMessage = messages[index + 1];
        const isPreviousMessageFromSameUser =
          previousMessage && previousMessage.usersId === message.usersId;
        const isNextMessageFromSameUser =
          nextMessage && nextMessage.usersId === message.usersId;
        return (
          <Row
            key={`${message.id}-${index}`}
            message={message}
            isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
            isNextMessageFromSameUser={isNextMessageFromSameUser}
          />
        );
      });
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
      communityInviteUrl={communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div>
        <div className="py-8 px-4">
          <ul>{elements}</ul>

          <div className="gap-8 columns-2">
            <div className={styles.buttons}>
              <Anchor
                className={styles.join}
                href={threadCommunityInviteUrl || threadUrl}
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
              <span className={styles.subtext}>View count:</span>{' '}
              {viewCount + 1}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
