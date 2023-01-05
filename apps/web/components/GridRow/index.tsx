import React from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import { Avatar, Message } from '@linen/ui';
import Actions from 'components/Actions';
import CheckIcon from 'components/icons/CheckIcon';
import { format } from '@linen/utilities/date';
import { Mode } from '@linen/hooks/mode';
import {
  Permissions,
  Settings,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  ThreadState,
} from '@linen/types';
import styles from './index.module.scss';

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  isPreviousMessageFromSameUser?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  mode?: Mode;
  drag: 'thread' | 'message';
  header?: React.ReactNode;
  footer?: React.ReactNode;
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
  onLoad?(): void;
}

export function Row({
  className,
  thread,
  message,
  isPreviousMessageFromSameUser,
  isSubDomainRouting,
  currentUser,
  settings,
  permissions,
  mode,
  drag,
  header,
  footer,
  onReaction,
  onPin,
  onLoad,
}: Props) {
  const top = !isPreviousMessageFromSameUser;
  return (
    <div
      className={classNames(className, styles.container, {
        [styles.top]: top,
      })}
    >
      {header}
      <div
        className={classNames(styles.row, {
          [styles.drag]: mode === Mode.Drag,
        })}
      >
        <div className={styles.left}>
          {top ? (
            <Avatar
              size="lg"
              src={message.author?.profileImageUrl}
              text={message.author?.displayName}
              Image={Image}
            />
          ) : (
            <span className={styles.date}>{format(message.sentAt, 'p')}</span>
          )}
        </div>
        <div className={styles.content}>
          {top && (
            <div className={styles.header}>
              <p className={styles.username}>
                {message.author?.displayName || 'user'}
              </p>
              <div className={styles.date}>{format(message.sentAt, 'Pp')}</div>
              {thread.state === ThreadState.CLOSE && <CheckIcon />}
            </div>
          )}
          <div
            className={classNames(styles.message, {
              [styles.top]: top,
              [styles.basic]: !top,
            })}
          >
            <Message
              text={message.body}
              format={message.messageFormat}
              mentions={message.mentions}
              reactions={message.reactions}
              attachments={message.attachments}
              currentUser={currentUser}
              onLoad={onLoad}
            />
            {footer}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Actions
          thread={thread}
          message={message}
          settings={settings}
          permissions={permissions}
          currentUser={currentUser}
          isSubDomainRouting={isSubDomainRouting}
          drag={drag}
          onPin={onPin}
          onReaction={onReaction}
          mode={mode}
        />
      </div>
    </div>
  );
}

export default Row;
