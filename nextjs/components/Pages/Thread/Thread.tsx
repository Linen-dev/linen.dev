import { AiOutlineLink } from 'react-icons/ai';
import { useMemo, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import styles from './index.module.css';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import Row from '../../Message/Row';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import { SerializedMessage } from 'serializers/thread';

export default function Thread({
  threadId,
  messages,
  channels,
  currentChannel,
  communityUrl,
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
            communityType={settings.communityType}
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

  function buildTitle(
    channelName: string | undefined,
    message?: SerializedMessage
  ) {
    const channel = !!channelName ? `#${channelName}` : '';
    return `${channel} - ${message?.body.slice(0, 30)}`;
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
      communityUrl={communityUrl}
      communityInviteUrl={communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <div className={styles.thread}>
        <ul>{elements}</ul>

        <div className={styles.footer}>
          <JoinChannelLink
            href={threadCommunityInviteUrl || threadUrl}
            communityType={settings.communityType}
          />
          <div className={styles.count}>
            <span className={styles.subtext}>View count:</span> {viewCount + 1}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
