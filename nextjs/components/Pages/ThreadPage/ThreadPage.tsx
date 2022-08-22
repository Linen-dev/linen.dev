import { useMemo, useEffect } from 'react';
import PageLayout from '../../layout/PageLayout';
import styles from './index.module.css';
import { ThreadByIdProp } from '../../../types/apiResponses/threads/[threadId]';
import Row from '../../Message/Row';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import { SerializedMessage } from 'serializers/thread';
import { Settings } from 'services/accountSettings';

export default function ThreadPage({
  threadId,
  messages,
  channels,
  currentChannel,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
}: ThreadByIdProp) {
  if (!threadId) {
    return <div></div>;
  }

  useEffect(() => {
    fetch(`/api/threads?incrementId=${threadId}`, { method: 'PUT' });
  }, []);

  function buildTitle(
    channelName: string | undefined,
    message?: SerializedMessage
  ) {
    const channel = !!channelName ? `#${channelName}` : '';
    return `${channel} - ${message?.body.slice(0, 30)}`;
  }

  return (
    <PageLayout
      seo={{
        title: buildTitle(currentChannel?.channelName, messages[0]),
      }}
      communityName={settings.communityName}
      currentChannel={currentChannel}
      navItems={{ channels: channels }}
      communityUrl={settings.communityUrl}
      communityInviteUrl={settings.communityInviteUrl}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
    >
      <Thread
        messages={messages}
        threadUrl={threadUrl}
        settings={settings}
        viewCount={viewCount}
      />
    </PageLayout>
  );
}

function Thread({
  messages,
  threadUrl,
  settings,
  viewCount,
}: {
  messages: SerializedMessage[];
  threadUrl: string;
  settings: Settings;
  viewCount: number;
}) {
  const elements = useMemo(() => {
    return messages
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
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

  return (
    <div className={styles.thread}>
      <ul>{elements}</ul>

      <div className={styles.footer}>
        <JoinChannelLink
          href={threadUrl}
          communityType={settings.communityType}
        />
        <div className={styles.count}>
          <span className={styles.subtext}>View count:</span> {viewCount + 1}
        </div>
      </div>
    </div>
  );
}
