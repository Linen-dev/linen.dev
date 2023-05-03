import React from 'react';
import Droppable from './Droppable';
import Avatars from '@/Avatars';
import GridRow from '@/GridRow';
import styles from './index.module.scss';
import {
  Permissions,
  Settings,
  SerializedThread,
  SerializedUser,
  ReminderTypes,
  onResolve,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import { FiMessageCircle } from '@react-icons/all-files/fi/FiMessageCircle';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { uniqueUsers } from '../utilities/uniqueUsers';

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
  onEdit?(threadId: string): void;
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
  Actions(): JSX.Element;
}

export default function ChannelRow({
  className,
  thread,
  permissions,
  isBot,
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
  Actions,
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

  return (
    <Droppable
      id={thread.id}
      className={styles.container}
      onClick={onClick}
      onDrop={onDrop}
    >
      <GridRow
        Actions={Actions}
        className={className}
        thread={thread}
        message={message}
        isSubDomainRouting={isSubDomainRouting}
        isBot={isBot}
        settings={settings}
        permissions={permissions}
        currentUser={currentUser}
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
        footer={({ inView }) =>
          messages.length > 1 && (
            <div className={styles.footer}>
              <Avatars
                size="sm"
                users={avatars}
                placeholder={!inView || isBot}
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
  );
}
