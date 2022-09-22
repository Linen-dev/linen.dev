import React from 'react';
import Avatar, { Size } from 'components/Avatar';
import classNames from 'classnames';
import Message from '../../Message';
import { format } from 'timeago.js';
import { SerializedMessage } from 'serializers/message';
import CopyToClipboardIcon from 'components/Pages/ChannelsPage/CopyToClipboardIcon';
import styles from './index.module.css';

interface Props {
  message: SerializedMessage;
  communityType: string;
  isPreviousMessageFromSameUser?: boolean;
  threadLink?: string;
  children?: React.ReactNode;
}

export function Row({
  message,
  isPreviousMessageFromSameUser,
  communityType,
  threadLink,
  children,
}: Props) {
  return (
    <div id={message.id} className={classNames(styles.row)} key={message.id}>
      <div className={styles.avatar}>
        {!isPreviousMessageFromSameUser && (
          <Avatar
            size={Size.lg}
            alt={message.author?.displayName || 'avatar'}
            src={message.author?.profileImageUrl}
            text={(message.author?.displayName || '?')
              .slice(0, 1)
              .toLowerCase()}
          />
        )}
      </div>
      <div className={styles.content}>
        {!isPreviousMessageFromSameUser && (
          <div className={styles.header}>
            <p className={styles.username}>
              {message.author?.displayName || 'user'}
            </p>
            <div className={styles.date}>
              {format(new Date(message.sentAt))}
            </div>
          </div>
        )}
        <div className={styles.showOnHover}>
          {!!threadLink && (
            <div className={styles.threadLink}>
              <CopyToClipboardIcon
                getText={() => threadLink + '#' + message.id}
              />
            </div>
          )}
          <Message
            text={message.body}
            format={communityType}
            mentions={message.mentions?.map((m) => m.users)}
            reactions={message.reactions}
            attachments={message.attachments}
          />
          {children}
        </div>
      </div>
    </div>
  );
}

export default Row;
