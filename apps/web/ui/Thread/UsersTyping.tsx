import { SerializedUser } from '@linen/types';
import React, { useMemo } from 'react';

const typingTimeout = 2000;

export function UsersTyping({
  currentUser,
  ...rest
}: {
  usersTyping: string[];
  currentUser?: SerializedUser | null;
}) {
  const usersTyping = useMemo(
    () => rest.usersTyping.filter((u) => u !== currentUser?.displayName),
    [rest.usersTyping, currentUser]
  );

  if (!usersTyping.length) {
    return <></>;
  }

  const isAre = usersTyping.length === 1 ? 'is' : 'are';
  return (
    <span
      style={{
        fontSize: 'small',
        fontStyle: 'italic',
        color: 'var(--color-gray-400)',
        position: 'absolute',
      }}
    >
      {usersTyping.join(', ')} {isAre} typing...
    </span>
  );
}

export function TypingFunctions({
  isUserTyping,
  setUserTyping,
  userTyping,
  currentUser,
}: {
  isUserTyping: boolean;
  setUserTyping: React.Dispatch<React.SetStateAction<boolean>>;
  userTyping: ({
    typing,
    username,
  }: {
    typing: boolean;
    username: string;
  }) => void;
  currentUser: SerializedUser | null;
}) {
  let typingTimer: NodeJS.Timeout;

  const userStartsTyping = function () {
    if (isUserTyping) {
      return;
    }
    setUserTyping(true);
    userTyping({ typing: true, username: currentUser?.displayName! });
  };

  const userStopsTyping = function () {
    clearTimeout(typingTimer);
    setUserTyping(false);
    userTyping({ typing: false, username: currentUser?.displayName! });
  };

  const onKeyDown = () => {
    userStartsTyping();
    clearTimeout(typingTimer);
  };

  const onKeyUp = () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(userStopsTyping, typingTimeout);
  };

  return { onKeyDown, onKeyUp };
}
