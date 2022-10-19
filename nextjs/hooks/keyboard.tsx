import React, { useEffect, useState } from 'react';

export default function useKeyboard() {
  const [isShiftPressed, setShiftPressed] = useState(false);

  const onKey = (event: KeyboardEvent) => {
    setShiftPressed(event.shiftKey);
    return true;
  };

  useEffect(() => {
    document.addEventListener('keyup', onKey);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keyup', onKey);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return { isShiftPressed };
}
