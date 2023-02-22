import React from 'react';
import classNames from 'classnames';
import { FiArrowDown } from '@react-icons/all-files/fi/FiArrowDown';
import styles from './index.module.scss';

interface Props {
  show: boolean;
  onClick(): void;
}

export default function ScrollToBottomIcon({ show, onClick }: Props) {
  return (
    <div
      className={classNames(styles.jump, { [styles.show]: show })}
      onClick={onClick}
    >
      <FiArrowDown className={styles.icon} />
    </div>
  );
}
