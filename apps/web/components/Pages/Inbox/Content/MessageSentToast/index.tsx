import React, { useEffect, useState } from 'react';
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
            <a
              className={styles.undo}
              onClick={() => {
                setUndo(true);
                onUndo();
              }}
            >
              Undo
            </a>
          )}
        </>
      )}
    </div>
  );
}
