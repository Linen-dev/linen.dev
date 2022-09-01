import styles from './index.module.css';
import { SerializedMessage } from 'serializers/thread';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import Row from 'components/Message/Row';
import { useMemo } from 'react';
import type { Settings } from 'services/accountSettings';
import { getThreadUrl } from 'components/Pages/ChannelsPage/utilities/url';

export function Thread({
  messages,
  threadUrl,
  viewCount,
  isSubDomainRouting,
  settings,
  incrementId,
  slug,
}: {
  messages: SerializedMessage[];
  threadUrl: string;
  viewCount: number;
  isSubDomainRouting: boolean;
  settings: Settings;
  incrementId?: number;
  slug?: string;
}) {
  const threadLink = getThreadUrl({
    incrementId: incrementId!,
    isSubDomainRouting,
    settings,
    slug,
  });

  const elements = useMemo(() => {
    return messages
      .sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
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
            threadLink={threadLink}
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
