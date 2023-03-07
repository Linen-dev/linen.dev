import React from 'react';
import Title from './Title';
import { StickyHeader } from '@linen/ui';
import classNames from 'classnames';
import { ThreadState } from '@linen/database';
import { GoCheck } from '@react-icons/all-files/go/GoCheck';
import { GoChevronLeft } from '@react-icons/all-files/go/GoChevronLeft';
import { GoX } from '@react-icons/all-files/go/GoX';
import { GoSync } from '@react-icons/all-files/go/GoSync';
import { GoScreenFull } from '@react-icons/all-files/go/GoScreenFull';
import { GoScreenNormal } from '@react-icons/all-files/go/GoScreenNormal';
import { SerializedThread } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  channelName: string;
  manage: boolean;
  expanded?: boolean;
  onClose?(): void;
  onCloseThread(): void;
  onExpandClick?(): void;
  onReopenThread(): void;
  onSetTitle(title: string): void;
}

export default function Header({
  thread,
  channelName,
  manage,
  expanded,
  onClose,
  onCloseThread,
  onExpandClick,
  onReopenThread,
  onSetTitle,
}: Props) {
  const { title, state } = thread;
  return (
    <StickyHeader>
      <div className={styles.container}>
        <div className={styles.center}>
          <div className={styles.header}>
            {onClose && (
              <div className="md:hidden">
                <a onClick={onClose}>
                  <GoChevronLeft />
                </a>
              </div>
            )}
            <div>
              <Title
                title={title}
                state={state}
                manage={manage}
                onSetTitle={onSetTitle}
              />
              <div className="text-gray-600 text-xs ">#{channelName}</div>
            </div>
          </div>
        </div>
        <div className={styles.icons}>
          {onExpandClick && (
            <a className={styles.icon} onClick={onExpandClick}>
              {expanded ? <GoScreenNormal /> : <GoScreenFull />}
            </a>
          )}
          {manage && (
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
