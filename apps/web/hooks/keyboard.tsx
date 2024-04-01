import React, { useEffect, useState } from 'react';

interface Props {
  onKeyUp?(event: KeyboardEvent): void;
  onKeyDown?(event: KeyboardEvent): void;
}

export default function useKeyboard(
  { onKeyUp, onKeyDown }: Props = {},
  dependencies?: any
) {
  const [isShiftPressed, setShiftPressed] = useState(false);

  const handleKeyUp = (event: KeyboardEvent) => {
    onKeyUp?.(event);
    setShiftPressed(event.shiftKey);
    return true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    onKeyDown?.(event);
    setShiftPressed(event.shiftKey);
    return true;
  };

  useEffect(() => {
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, dependencies || []);

  return { isShiftPressed };
}
