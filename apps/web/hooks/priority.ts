import { useEffect, useState } from 'react';
import { Priority } from '@linen/types';

function usePriority() {
  const [priority, setPriority] = useState(Priority.KEYBOARD);
  useEffect(() => {
    const onMouseAction = () => {
      setPriority(Priority.MOUSE);
    };
    const onKeyboardAction = () => {
      setPriority(Priority.KEYBOARD);
    };
    window.addEventListener('keyup', onKeyboardAction);
    window.addEventListener('keydown', onKeyboardAction);
    window.addEventListener('mousemove', onMouseAction);
    return () => {
      window.removeEventListener('keyup', onKeyboardAction);
      window.removeEventListener('keydown', onKeyboardAction);
      window.removeEventListener('mousemove', onMouseAction);
    };
  }, []);

  return { priority };
}

export default usePriority;
