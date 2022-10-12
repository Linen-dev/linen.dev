import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { FiHash } from 'react-icons/fi';

interface Props {
  channelName: string;
}

export default function Header({ channelName }: Props) {
  return (
    <div
      className={classNames(
        styles.header,
        'border-b border-solid border-gray-200 py-4 px-4'
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-center">
          <div>
            <div className={styles.title}>
              <FiHash /> {channelName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
