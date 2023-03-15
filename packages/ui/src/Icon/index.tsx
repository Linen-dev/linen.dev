import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?(): void;
}

export default function Icon({
  className,
  children,
  disabled,
  onClick,
}: Props) {
  return (
    <div
      className={classNames(className, styles.icon, {
        [styles.disabled]: disabled,
      })}
      onClick={onClick}
      tabIndex={0}
      onKeyUp={(event) => {
        if (!disabled && event.key === 'Enter') {
          onClick?.();
        }
      }}
    >
      {children}
    </div>
  );
}
