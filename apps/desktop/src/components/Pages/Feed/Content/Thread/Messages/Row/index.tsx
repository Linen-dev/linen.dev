import React from 'react';
// import Image from 'next/image';
import { Avatar } from '@linen/ui';
import classNames from 'classnames';
// import DraggableRow from './DraggableRow';
import { Message } from '@linen/ui';
import { format } from '@linen/utilities/date';
import styles from './index.module.scss';
// import CheckIcon from 'components/icons/CheckIcon';
// import Actions from 'components/Actions';
import { Mode } from '@linen/hooks/mode';
import {
  Permissions,
  Settings,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  ThreadState,
} from '@linen/types';

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
  header,
  footer,
  onReaction,
  onPin,
}: Props) {
  const top = !isPreviousMessageFromSameUser;
  const owner = currentUser ? currentUser.id === message.usersId : false;
  const draggable = permissions.manage || owner;
  return (
    // <DraggableRow
    //   id={message.id}
    //   className={classNames(className, {
    //     [styles.top]: top,
    //   })}
    //   draggable={draggable}
    //   mode={mode}
    // >
    <div
      className={classNames(className, {
        [styles.top]: top,
      })}
    >
      {header}
      <div className={styles.row}>
        <div className={styles.left}>
          {top ? (
            <Avatar
              size="lg"
              src={message.author?.profileImageUrl}
              text={message.author?.displayName}
              // Image={Image}
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
              {/* {thread.state === ThreadState.CLOSE && <CheckIcon />} */}
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
            />
            {footer}
            {/* <div className={styles.actions}>
              <Actions
                thread={thread}
                message={message}
                settings={settings}
                permissions={permissions}
                currentUser={currentUser}
                isSubDomainRouting={isSubDomainRouting}
                onPin={onPin}
                onReaction={onReaction}
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
    // </DraggableRow>
  );
}

export default Row;
