import React, { useRef } from 'react';
import classNames from 'classnames';
import Portal from '@/Portal';
import styles from './index.module.scss';

type ModalProps = {
  className?: string;
  open: boolean;
  close: (value: boolean) => void;
  children: any;
  size?: 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'top';
};

export default function Modal({
  className,
  open,
  close,
  children,
  size,
  position,
}: ModalProps) {
  const ref = useRef(null);
  if (!open) {
    return null;
  }

  return (
    <Portal id="modal-portal">
      <div className={classNames(styles.modal, className)}>
        <div className={styles.overlay} />
        <div className={styles.container}>
          <div
            className={classNames(styles.center, {
              [styles.top]: position === 'top',
            })}
            onClick={(event) => {
              if (event.target === ref.current) {
                close(true);
              }
            }}
            ref={ref}
          >
            <div
              className={classNames(styles.content, {
                [styles.full]: size === 'full',
                [styles.lg]: size === 'lg',
                [styles.xl]: size === 'xl',
              })}
            >
              <div>{children}</div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
