import React, { useState } from 'react';
import classNames from 'classnames';
import { ThreadState } from '@prisma/client';
import { Permissions } from 'types/shared';
import { GoCheck, GoChevronLeft, GoX, GoSync } from 'react-icons/go';
import styles from './index.module.css';

interface Props {
  title?: string | null;
  channelName: string;
  state: ThreadState;
  permissions: Permissions;
  onClose?(): void;
  onCloseThread(): void;
  onReopenThread(): void;
}

function getTitle({
  title,
  closed,
}: {
  title?: string | null;
  closed?: boolean;
}): string {
  title = title || 'Thread';
  if (closed) {
    return `[CLOSED] ${title}`;
  }
  return title;
}

export default function Header({
  title,
  channelName,
  state,
  permissions,
  onClose,
  onCloseThread,
  onReopenThread,
}: Props) {
  const [actions, setActions] = useState(false);
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
            <div className="text-lg font-bold block">
              {getTitle({ title, closed: state === ThreadState.CLOSE })}
            </div>
            <div className="text-gray-600 text-xs ">#{channelName}</div>
          </div>
        </div>
        <div className={styles.icons}>
          {permissions.feed && (
            <>
              {state === ThreadState.OPEN && (
                <a
                  className={styles.icon}
                  title="Close thread"
                  onClick={() => {
                    setActions(false);
                    onCloseThread();
                  }}
                >
                  <GoCheck />
                </a>
              )}
              {state === ThreadState.CLOSE && (
                <a
                  className={styles.icon}
                  title="Reopen thread"
                  onClick={() => {
                    setActions(false);
                    onReopenThread();
                  }}
                >
                  <GoSync />
                </a>
              )}
            </>
          )}
          {onClose && (
            <a
              onClick={onClose}
              className={classNames(styles.icon, styles.close)}
            >
              <GoX />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
