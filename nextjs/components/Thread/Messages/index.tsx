import React from 'react';
import Row from 'components/Message/Row';
import { SerializedMessage } from 'serializers/message';

interface Props {
  communityType: string;
  threadLink: string;
  messages: SerializedMessage[];
}

function Messages({ communityType, threadLink, messages }: Props) {
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
          message={message}
          isPreviousMessageFromSameUser={isPreviousMessageFromSameUser}
          communityType={communityType}
          threadLink={threadLink}
        />
      </div>
    );
  });

  return <ul>{elements}</ul>;
}

export default Messages;
