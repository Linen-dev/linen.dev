import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiAlertTriangle } from '@react-icons/all-files/fi/FiAlertTriangle';
import { FiInfo } from '@react-icons/all-files/fi/FiInfo';

type AlertType = 'info' | 'danger';

interface Props {
  className?: string;
  type: AlertType;
  children: React.ReactNode;
}

function icon(type: AlertType) {
  switch (type) {
    case 'danger':
      return <FiAlertTriangle className={styles.icon} />;
    case 'info':
      return <FiInfo className={styles.icon} />;
  }
}

export default function Alert({ className, type, children }: Props) {
  return (
    <div
      className={classNames(styles.alert, className, {
        [styles.danger]: type === 'danger',
        [styles.info]: type === 'info',
      })}
      role="alert"
    >
      {icon(type)}
      <span>{children}</span>
    </div>
  );
}
