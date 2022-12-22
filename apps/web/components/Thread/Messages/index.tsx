import React from 'react';
import classNames from 'classnames';
import GridRow from 'components/GridRow';
import { SerializedThread } from '@linen/types';
import { SerializedUser } from '@linen/types';
import { Settings } from '@linen/types';
import { Permissions } from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
  mode?: Mode;
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

function Messages({
  thread,
  permissions,
  settings,
  isSubDomainRouting,
  currentUser,
  mode,
  onReaction,
  onLoad,
}: Props) {
  const { messages } = thread;
  const elements = messages.map((message, index) => {
    const previousMessage = messages[index - 1];
    const isPreviousMessageFromSameUser =
      previousMessage && previousMessage.usersId === message.usersId;
    return (
      <div key={`${message.id}-${index}`} className={styles.container}>
        <GridRow
          className={classNames(styles.row, {
            [styles.top]: !isPreviousMessageFromSameUser,
          })}
          thread={thread}
          message={message}
          isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
          permissions={permissions}
          currentUser={currentUser}
          settings={settings}
          isSubDomainRouting={isSubDomainRouting}
          mode={mode}
          drag='message'
          onReaction={onReaction}
          onLoad={onLoad}
        />
      </div>
    );
  });

  return <div>{elements}</div>;
}

export default Messages;
