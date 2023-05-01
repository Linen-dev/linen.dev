import React from 'react';
import Avatar from '../Avatar';
import Badge from '../Badge';
import Message from '../Message';
import { SerializedMessage, SerializedUser } from '@linen/types';
import styles from './index.module.scss';
import { format } from '@linen/utilities/date';

interface Props {
  message: SerializedMessage;
  currentUser?: SerializedUser | null;
}

function Row({ message, currentUser }: Props) {
  return (
    <div className={styles.container}>
      <Badge className={styles.badge}>Preview</Badge>
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
            <div className={styles.date}>MM/DD/YYYY</div>
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

export default Row;
