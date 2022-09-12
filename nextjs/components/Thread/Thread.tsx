import styles from './index.module.css';
import { SerializedMessage } from 'serializers/thread';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import Row from 'components/Message/Row';
import { useMemo } from 'react';
import type { Settings } from 'serializers/account/settings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';
import MessageForm from 'components/MessageForm';
import { isSendMessageEnabled } from 'utilities/featureFlags';
import { Permissions } from 'types/shared';

export function Thread({
  id,
  channelId,
  messages,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  incrementId,
  slug,
  title,
  permissions,
}: {
  id: string;
  channelId: string;
  messages: SerializedMessage[];
  threadUrl: string | null;
  viewCount: number;
  isSubDomainRouting: boolean;
  settings: Settings;
  incrementId?: number;
  slug?: string;
  title: string | null;
  permissions: Permissions;
}) {
  const threadLink = getThreadUrl({
    incrementId: incrementId!,
    isSubDomainRouting,
    settings,
    slug,
  });

  const elements = useMemo(() => {
    return messages.map((message, index) => {
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
          threadLink={threadLink}
        />
      );
    });
  }, [messages]);

  return (
    <div className={styles.thread}>
      {title ? <h2 className={styles.title}>{title}</h2> : <></>}
      <ul>{elements}</ul>

      <div className={styles.footer}>
        {threadUrl && (
          <JoinChannelLink
            href={threadUrl}
            communityType={settings.communityType}
          />
        )}
        <div className={styles.count}>
          <span className={styles.subtext}>View count:</span> {viewCount + 1}
        </div>
      </div>
      {isSendMessageEnabled && permissions.sendMessage && (
        <div className="py-2 px-2 max-w-[500px]">
          <MessageForm channelId={channelId} threadId={id} />
        </div>
      )}
    </div>
  );
}
