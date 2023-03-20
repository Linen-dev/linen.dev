import React from 'react';
import classNames from 'classnames';
import { useInView } from 'react-intersection-observer';
import { Avatar, Badge, Message } from '@linen/ui';
import Actions from 'components/Actions';
import CheckIcon from 'components/icons/CheckIcon';
import { format } from '@linen/utilities/date';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { Mode } from '@linen/hooks/mode';
import useHover from '@linen/hooks/hover';
import {
  Permissions,
  Settings,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  ThreadState,
  ReminderTypes,
  onResolve,
} from '@linen/types';
import styles from './index.module.scss';

interface Props {
  className?: string;
  thread: SerializedThread;
  message: SerializedMessage;
  isBot?: boolean;
  isPreviousMessageFromSameUser?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  mode?: Mode;
  drag: 'thread' | 'message';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onDelete?(messageId: string): void;
  onLoad?(): void;
  onMute?(threadId: string): void;
  onUnmute?(threadId: string): void;
  onPin?(threadId: string): void;
  onStar?(threadId: string): void;
  onResolution?: onResolve;
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
  onRead?(threadId: string): void;
  onRemind?(threadId: string, reminder: ReminderTypes): void;
  onUnread?(threadId: string): void;
}

function Left({
  top,
  message,
  isBot,
  hover,
  inView,
}: {
  top: boolean;
  message: SerializedMessage;
  isBot?: boolean;
  hover?: boolean;
  inView: boolean;
}) {
  if (top) {
    return (
      <Avatar
        className={styles.left}
        src={message.author?.profileImageUrl}
        text={message.author?.displayName}
        placeholder={!inView || isBot}
      />
    );
  }

  return (
    <div className={styles.left}>
      {hover && (
        <span className={styles.date}>{format(message.sentAt, 'p')}</span>
      )}
    </div>
  );
}

export function Row({
  className,
  thread,
  message,
  isBot,
  isPreviousMessageFromSameUser,
  isSubDomainRouting,
  currentUser,
  settings,
  permissions,
  mode,
  drag,
  header,
  footer,
  onDelete,
  onLoad,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onResolution,
  onReaction,
  onRead,
  onRemind,
  onUnread,
}: Props) {
  const [ref, hover] = useHover<HTMLDivElement>();
  const { ref: inViewRef, inView } = useInView();
  const top = !isPreviousMessageFromSameUser;
  const resolution = thread.resolutionId === message.id;

  return (
    <div
      ref={ref}
      className={classNames(className, styles.container, {
        [styles.resolution]: resolution,
        [styles.top]: top,
      })}
    >
      {header}
      <div
        ref={inViewRef}
        className={classNames(styles.row, {
          [styles.drag]: mode === Mode.Drag,
        })}
      >
        <Left
          message={message}
          top={top}
          isBot={isBot}
          hover={hover}
          inView={inView}
        />
        <div className={styles.content}>
          {top && (
            <div className={styles.header}>
              <p className={styles.username}>
                {message.author?.displayName || 'user'}
              </p>
              {format(message.sentAt, 'Pp')}
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
            {resolution && (
              <Badge className={styles.badge} type="success">
                <FiCheck className={styles.resolutionCheck} />
                Resolution
              </Badge>
            )}
            {footer}
          </div>
        </div>
      </div>
      {hover && (
        <div className={styles.actions}>
          <Actions
            thread={thread}
            message={message}
            settings={settings}
            permissions={permissions}
            currentUser={currentUser}
            isSubDomainRouting={isSubDomainRouting}
            drag={drag}
            onDelete={onDelete}
            onMute={onMute}
            onUnmute={onUnmute}
            onPin={onPin}
            onStar={onStar}
            onResolution={onResolution}
            onReaction={onReaction}
            onRead={onRead}
            onRemind={onRemind}
            onUnread={onUnread}
            mode={mode}
          />
        </div>
      )}
    </div>
  );
}

export default Row;
