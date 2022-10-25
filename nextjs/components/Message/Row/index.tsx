import React from 'react';
import Avatar from 'components/Avatar';
import classNames from 'classnames';
import Message from '../../Message';
import { format } from 'timeago.js';
import { SerializedThread } from 'serializers/thread';
import { SerializedMessage } from 'serializers/message';
import { Settings } from 'serializers/account/settings';
import { SerializedUser } from 'serializers/user';
import { ThreadState } from '@prisma/client';
import styles from './index.module.scss';
import CheckIcon from 'components/icons/CheckIcon';
import Actions from 'components/Actions';
import { Permissions } from 'types/shared';

interface Props {
  thread: SerializedThread;
  message: SerializedMessage;
  isPreviousMessageFromSameUser?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  children?: React.ReactNode;
  currentUser: SerializedUser | null;
  onPin?(threadId: string): void;
  onReaction?({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }): void;
  onMerge?(threadId: string): void;
}

export function Row({
  thread,
  message,
  isPreviousMessageFromSameUser,
  children,
  isSubDomainRouting,
  currentUser,
  settings,
  permissions,
  onReaction,
  onPin,
  onMerge,
}: Props) {
  return (
    <div id={message.id} className={classNames(styles.row)}>
      <div className={styles.avatar}>
        {!isPreviousMessageFromSameUser && (
          <Avatar
            size="lg"
            src={message.author?.profileImageUrl}
            text={message.author?.displayName}
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
            {thread.state === ThreadState.CLOSE && <CheckIcon />}
          </div>
        )}
        <div className={styles.message}>
          <Message
            text={message.body}
            format={message.messageFormat}
            mentions={message.mentions}
            reactions={message.reactions}
            attachments={message.attachments}
            currentUser={currentUser}
          />
          {children}
          <div className={styles.actions}>
            <Actions
              thread={thread}
              message={message}
              settings={settings}
              permissions={permissions}
              currentUser={currentUser}
              isSubDomainRouting={isSubDomainRouting}
              onPin={onPin}
              onReaction={onReaction}
              onMerge={onMerge}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Row;
