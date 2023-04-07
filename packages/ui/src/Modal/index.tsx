import React, { useRef } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

type ModalProps = {
  className?: string;
  open: boolean;
  close: (value: boolean) => void;
  children: any;
  fullscreen?: boolean;
  size?: 'md' | 'lg';
};

export default function Modal({
  className,
  open,
  close,
  children,
  fullscreen,
  size,
}: ModalProps) {
  const ref = useRef(null);
  if (!open) {
    return null;
  }

  return (
    <div className={classNames(styles.modal, className)}>
      <div className={styles.overlay} />
      <div className={styles.container}>
        <div
          className={styles.center}
          onClick={(event) => {
            if (event.target === ref.current) {
              close(true);
            }
          }}
          ref={ref}
        >
          <div
            className={classNames(styles.content, {
              [styles.fullscreen]: fullscreen,
              [styles.lg]: size === 'lg',
            })}
          >
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
