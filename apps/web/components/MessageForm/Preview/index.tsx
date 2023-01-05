import Image from 'next/image';
import { Avatar, Message } from '@linen/ui';
import { SerializedMessage, SerializedUser } from '@linen/types';
import styles from './index.module.scss';
import { format } from '@linen/utilities/date';

interface Props {
  message: SerializedMessage;
  currentUser?: SerializedUser | null;
}

export function Row({ message, currentUser }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.left}>
          <Avatar
            size="lg"
            src={message.author?.profileImageUrl}
            text={message.author?.displayName}
            Image={Image}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.header}>
            <p className={styles.username}>
              {message.author?.displayName || 'user'}
            </p>
            <div className={styles.date}>{format(message.sentAt, 'Pp')}</div>
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
