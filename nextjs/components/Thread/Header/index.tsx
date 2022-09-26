import React from 'react';
import classNames from 'classnames';
import { GoChevronLeft, GoX } from 'react-icons/go';
import styles from './index.module.css';

interface Props {
  title?: string | null;
  channelName: string;
  onClose?(): void;
  closed?: boolean;
}

export default function Header({ title, channelName, onClose, closed }: Props) {
  return (
    <div
      className={classNames(
        styles.header,
        'border-b border-solid border-gray-200 py-4 px-4'
      )}
    >
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row justify-center">
          {onClose && (
            <div className="flex items-center md:hidden mr-2">
              <a onClick={onClose}>
                <GoChevronLeft />
              </a>
            </div>
          )}

          <div>
            <div className="text-lg font-bold block">{title || 'Thread'}</div>
            <div className="text-gray-600 text-xs ">#{channelName}</div>
          </div>
        </div>
        <div className="flex flex-row">
          {closed && (
            <div className="inline-block px-3 py-1.5 mr-2 text-xs text-blue-900 bg-blue-100 rounded-md">
              Thread Closed
            </div>
          )}
          {onClose && (
            <a onClick={onClose} className={classNames(styles.close)}>
              <GoX />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
