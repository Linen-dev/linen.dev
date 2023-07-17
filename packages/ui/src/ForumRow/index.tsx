import React from 'react';
import classNames from 'classnames';
import Droppable from '../Row/Droppable';
import Avatars from '@/Avatars';
import GridRow from '@/GridRow';
import styles from './index.module.scss';
import {
  Permissions,
  Settings,
  SerializedThread,
  SerializedUser,
  SerializedMessage,
  SerializedReaction,
  ReminderTypes,
  onResolve,
  ThreadState,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import { FiMessageCircle } from '@react-icons/all-files/fi/FiMessageCircle';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { uniqueUsers } from '../Row/utilities/uniqueUsers';
import { FiChevronDown } from '@react-icons/all-files/fi/FiChevronDown';
import { FiChevronUp } from '@react-icons/all-files/fi/FiChevronUp';

interface Props {
  className?: string;
  thread: SerializedThread;
  permissions: Permissions;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  currentUser: SerializedUser | null;
  mode?: Mode;
  onClick?(): void;
  onDelete?(messageId: string): void;
  onEdit?(threadId: string, messageId: string): void;
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
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }): void;
  onRead?(threadId: string): void;
  onRemind?(threadId: string, reminder: ReminderTypes): void;
  onUnread?(threadId: string): void;
}

function hasReaction(
  message: SerializedMessage,
  type: string,
  userId?: string
): boolean {
  if (!userId) {
    return false;
  }
  const reaction = message.reactions.find(
    (reaction: SerializedReaction) => reaction.type === type
  );
  if (!reaction) {
    return false;
  }
  return !!reaction.users.find(({ id }: SerializedUser) => id === userId);
}

export default function ChannelRow({
  className,
  thread,
  permissions,
  isBot = false,
  isSubDomainRouting,
  settings,
  currentUser,
  mode,
  onClick,
  onDelete,
  onEdit,
  onDrop,
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
  const { messages } = thread;
  const message = messages[0];
  let users = messages.map((m) => m.author).filter(Boolean) as SerializedUser[];
  const authors = uniqueUsers(users);
  const avatars = authors
    .filter((user) => user.id !== message.author?.id)
    .map((a) => ({
      src: a.profileImageUrl,
      text: a.displayName,
    }));

  const upvotes = message.reactions.find(
    (reaction: SerializedReaction) => reaction.type === ':thumbsup:'
  ) || { count: 0 };
  const downvotes = message.reactions.find(
    (reaction: SerializedReaction) => reaction.type === ':thumbsdown:'
  ) || { count: 0 };
  const votes = upvotes.count - downvotes.count;
  const isThumbsUpActive = hasReaction(message, ':thumbsup:', currentUser?.id);
  const isThumbsDownActive = hasReaction(
    message,
    ':thumbsdown:',
    currentUser?.id
  );

  return (
    <>
      {thread?.channel?.viewType === 'FORUM' && onReaction && (
        <div
          className={classNames(styles.left, {
            [styles.positive]: votes > 0,
            [styles.negative]: votes < 0,
          })}
        >
          <FiChevronUp
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onReaction({
                threadId: thread.id,
                messageId: message.id,
                type: ':thumbsup:',
                active: isThumbsUpActive,
              });
            }}
            className={classNames(styles.icon, {
              [styles.active]: isThumbsUpActive,
            })}
          />
          {votes}
          <FiChevronDown
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onReaction({
                threadId: thread.id,
                messageId: message.id,
                type: ':thumbsdown:',
                active: isThumbsDownActive,
              });
            }}
            className={classNames(styles.icon, {
              [styles.active]: isThumbsDownActive,
            })}
          />
        </div>
      )}
      <Droppable
        id={thread.id}
        className={styles.container}
        onClick={onClick}
        onDrop={onDrop}
      >
        <GridRow
          className={className}
          thread={thread}
          message={message}
          isSubDomainRouting={isSubDomainRouting}
          isBot={isBot}
          settings={settings}
          permissions={permissions}
          currentUser={currentUser}
          truncate={message.body.length > 280}
          mode={mode}
          drag="thread"
          onDelete={onDelete}
          onEdit={onEdit}
          onLoad={onLoad}
          onMute={onMute}
          onUnmute={onUnmute}
          onPin={onPin}
          onStar={onStar}
          onResolution={onResolution}
          onReaction={onReaction}
          onRead={onRead}
          onRemind={onRemind}
          onUnread={onUnread}
          header={
            thread.title && <div className={styles.header}>{thread.title}</div>
          }
          info={
            thread.state === ThreadState.CLOSE && (
              <FiCheck className={styles.check} />
            )
          }
          footer={({ inView }) =>
            messages.length > 1 && (
              <div className={styles.footer}>
                <Avatars
                  size="sm"
                  users={avatars}
                  placeholder={!inView || isBot}
                  isBot={isBot}
                />
                <ul className={styles.list}>
                  <li className={styles.info}>
                    {authors.length}{' '}
                    {authors.length > 1 ? <FiUsers /> : <FiUser />}
                  </li>
                  <li className={styles.info}>
                    {messages.length - 1} <FiMessageCircle />
                  </li>
                </ul>
              </div>
            )
          }
        />
      </Droppable>
    </>
  );
}
