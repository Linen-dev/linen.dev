import React, { useEffect, useState } from 'react';
import useKeyboard from '@linen/hooks/keyboard';
import styles from './index.module.scss';

interface Props {
  onUndo(): void;
  onContinue(): void;
  timeout: number;
}

export default function MessageSentToast({
  onUndo,
  onContinue,
  timeout,
}: Props) {
  const [sent, setSent] = useState(false);
  const [undo, setUndo] = useState(false);
  useEffect(() => {
    let mounted = true;
    let timer = setTimeout(() => {
      if (!undo && mounted) {
        onContinue();
        setSent(true);
      }
    }, timeout);

    return () => {
      clearTimeout(timer);
      mounted = false;
    };
  }, [undo]);

  function handleUndo() {
    setUndo(true);
    onUndo();
  }

  useKeyboard(
    {
      onKeyUp(event) {
        const element = document.activeElement;
        if (element && element.id) {
          return false;
        }

        if (!sent && !undo && event.key === 'u') {
          handleUndo();
        }
      },
    },
    [sent, undo]
  );

  if (undo) {
    return <div className={styles.toast}>Sending was canceled.</div>;
  }

  return (
    <div className={styles.toast}>
      {sent ? (
        <>Message was sent.</>
      ) : (
        <>
          Sending the message…
          {!undo && (
            <a className={styles.undo} onClick={handleUndo}>
              Undo
            </a>
          )}
        </>
      )}
    </div>
  );
}
