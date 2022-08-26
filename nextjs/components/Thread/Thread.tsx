import styles from './index.module.css';
import { SerializedMessage } from 'serializers/thread';
import JoinChannelLink from 'components/Link/JoinChannelLink';
import Row from 'components/Message/Row';
import { useMemo } from 'react';

export function Thread({
  messages,
  threadUrl,
  communityType,
  viewCount,
}: {
  messages: SerializedMessage[];
  threadUrl: string;
  communityType: string;
  viewCount: number;
}) {
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
            communityType={communityType}
          />
        );
      });
  }, [messages]);

  return (
    <div className={styles.thread}>
      <ul>{elements}</ul>

      <div className={styles.footer}>
        <JoinChannelLink href={threadUrl} communityType={communityType} />
        <div className={styles.count}>
          <span className={styles.subtext}>View count:</span> {viewCount + 1}
        </div>
      </div>
    </div>
  );
}
