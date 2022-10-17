import React from 'react';
import Row from 'components/Message/Row';
import { SerializedThread } from 'serializers/thread';
import { SerializedUser } from 'serializers/user';
import { Settings } from 'serializers/account/settings';
import { Permissions } from 'types/shared';

interface Props {
  thread: SerializedThread;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  currentUser: SerializedUser | null;
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

function Messages({
  thread,
  permissions,
  settings,
  isSubDomainRouting,
  currentUser,
  onReaction,
}: Props) {
  const { messages } = thread;
  const elements = messages.map((message, index) => {
    const previousMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const isPreviousMessageFromSameUser =
      previousMessage && previousMessage.usersId === message.usersId;
    const isNextMessageFromSameUser =
      nextMessage && nextMessage.usersId === message.usersId;
    return (
      <div
        key={`${message.id}-${index}`}
        className={isNextMessageFromSameUser ? '' : 'pb-4'}
      >
        <Row
          thread={thread}
          message={message}
          isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
          permissions={permissions}
          currentUser={currentUser}
          settings={settings}
          isSubDomainRouting={isSubDomainRouting}
          onReaction={onReaction}
        />
      </div>
    );
  });

  return <ul>{elements}</ul>;
}

export default Messages;
