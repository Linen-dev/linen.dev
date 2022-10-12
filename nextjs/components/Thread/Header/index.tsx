import React from 'react';
import Title from './Title';
import StickyHeader from 'components/StickyHeader';
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
  onSetTitle(title: string): void;
}

export default function Header({
  title,
  channelName,
  state,
  permissions,
  onClose,
  onCloseThread,
  onReopenThread,
  onSetTitle,
}: Props) {
  return (
    <StickyHeader>
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
            <Title
              title={title}
              state={state}
              permissions={permissions}
              onSetTitle={onSetTitle}
            />
            <div className="text-gray-600 text-xs ">#{channelName}</div>
          </div>
        </div>
        <div className={styles.icons}>
          {permissions.manage && (
            <>
              {state === ThreadState.OPEN && (
                <a
                  className={styles.icon}
                  title="Close thread"
                  onClick={() => {
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
    </StickyHeader>
  );
}
