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
  mode?: Mode;
  onDelete?(messageId: string): void;
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
  Actions(args: any): JSX.Element;
}

function Messages({
  thread,
  permissions,
  settings,
  isBot,
  isSubDomainRouting,
  currentUser,
  mode,
  onDelete,
  onLoad,
  onReaction,
  onResolution,
  Actions,
}: Props) {
  const { messages } = thread;
  const elements = messages.map((message, index) => {
    const previousMessage = messages[index - 1];
    const isPreviousMessageFromSameUser =
      previousMessage && previousMessage.usersId === message.usersId;
    return (
      <div id={message.id} key={`${message.id}`} className={styles.container}>
        <GridRow
          {...{ Actions }}
          className={classNames(styles.row, {
            [styles.top]: !isPreviousMessageFromSameUser,
          })}
          thread={thread}
          message={message}
          isBot={isBot}
          isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
          permissions={permissions}
          currentUser={currentUser}
          settings={settings}
          isSubDomainRouting={isSubDomainRouting}
          mode={mode}
          drag="message"
          onDelete={onDelete}
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
