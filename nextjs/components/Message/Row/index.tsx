import React from 'react';
import Avatar from 'components/Avatar';
import classNames from 'classnames';
import Message from '../../Message';
import { format } from 'timeago.js';
import { SerializedMessage } from 'serializers/message';
import CopyToClipboardIcon from 'components/Pages/ChannelsPage/CopyToClipboardIcon';
import { ThreadState } from '@prisma/client';
import styles from './index.module.scss';
import CheckIcon from 'components/icons/CheckIcon';

interface Props {
  message: SerializedMessage;
  communityType: string;
  state?: ThreadState;
  isPreviousMessageFromSameUser?: boolean;
  threadLink?: string;
  children?: React.ReactNode;
}

export function Row({
  message,
  isPreviousMessageFromSameUser,
  state,
  communityType,
  threadLink,
  children,
}: Props) {
  return (
    <div id={message.id} className={classNames(styles.row)}>
      <div className={styles.avatar}>
        {!isPreviousMessageFromSameUser && (
          <Avatar
            size="lg"
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
            {state === ThreadState.CLOSE && <CheckIcon />}
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
            format={message.messageFormat}
            mentions={message.mentions}
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
