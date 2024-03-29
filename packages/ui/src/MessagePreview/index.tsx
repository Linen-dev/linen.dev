import React from 'react';
import Avatar from '@/Avatar';
import Badge from '@/Badge';
import Message from '@/Message';
import {
  SerializedMessage,
  SerializedUser,
  ChannelViewType,
} from '@linen/types';
import styles from './index.module.scss';

interface Props {
  title?: string;
  message: SerializedMessage;
  viewType?: ChannelViewType;
  currentUser?: SerializedUser | null;
  badge?: boolean;
}

function MessagePreview({
  title,
  badge,
  message,
  viewType,
  currentUser,
}: Props) {
  return (
    <div className={styles.container}>
      {title && (
        <div className={styles.title}>
          <span>{title}</span>
        </div>
      )}
      {badge && <Badge className={styles.badge}>Preview</Badge>}
      <div className={styles.row}>
        <div className={styles.left}>
          <Avatar
            src={message.author?.profileImageUrl}
            text={message.author?.displayName}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <p className={styles.username}>
              {message.author?.displayName || 'user'}
            </p>
          </div>
          <div className={styles.message}>
            <Message
              text={message.body}
              format={message.messageFormat}
              mentions={message.mentions}
              reactions={message.reactions}
              attachments={message.attachments}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessagePreview;
