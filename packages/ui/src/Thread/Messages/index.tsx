import React from 'react';
import classNames from 'classnames';
import GridRow from '@/GridRow';
import { SerializedThread } from '@linen/types';
import { SerializedUser } from '@linen/types';
import { Settings, onResolve } from '@linen/types';
import { Permissions } from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  permissions: Permissions;
  settings: Settings;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
  activeUsers?: string[];
  mode?: Mode;
  onDelete?(messageId: string): void;
  onEdit?(threadId: string, messageId: string): void;
  onResolution?: onResolve;
  onLoad?(): void;
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

function isAuthorActive(
  author: SerializedUser | null,
  currentUser: SerializedUser | null,
  activeUsers?: string[]
) {
  if (!author) {
    return false;
  }
  if (author.id === currentUser?.id) {
    return true;
  }
  if (author.authsId && activeUsers?.includes(author.authsId)) {
    return true;
  }
  return false;
}

function Messages({
  thread,
  permissions,
  settings,
  isBot,
  isSubDomainRouting,
  currentUser,
  activeUsers,
  mode,
  onDelete,
  onEdit,
  onLoad,
  onReaction,
  onResolution,
}: Props) {
  const { messages } = thread;
  const elements = messages.map((message, index) => {
    const previousMessage = messages[index - 1];
    const isPreviousMessageFromSameUser =
      previousMessage && previousMessage.usersId === message.usersId;

    return (
      <div id={message.id} key={`${message.id}`} className={styles.container}>
        <GridRow
          className={classNames(styles.row, {
            [styles.top]: !isPreviousMessageFromSameUser,
          })}
          thread={thread}
          message={message}
          isUserActive={isAuthorActive(
            message?.author,
            currentUser,
            activeUsers
          )}
          isBot={isBot}
          isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
          permissions={permissions}
          currentUser={currentUser}
          settings={settings}
          isSubDomainRouting={isSubDomainRouting}
          mode={mode}
          drag="message"
          onDelete={onDelete}
          onEdit={onEdit}
          onLoad={onLoad}
          onReaction={onReaction}
          onResolution={onResolution}
        />
      </div>
    );
  });

  return <div>{elements}</div>;
}

export default Messages;
