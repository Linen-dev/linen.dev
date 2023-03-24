import React from 'react';
import Title from './Title';
import { Icon, StickyHeader } from '@linen/ui';
import { ThreadState } from '@linen/database';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { FiRefreshCcw } from '@react-icons/all-files/fi/FiRefreshCcw';
import { FiMaximize } from '@react-icons/all-files/fi/FiMaximize';
import { FiMinimize } from '@react-icons/all-files/fi/FiMinimize';
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
              <div onClick={onClose}>
                <FiChevronLeft />
              </div>
            )}
            <div>
              <Title
                title={title}
                state={state}
                manage={manage}
                onSetTitle={onSetTitle}
              />
              {/* <div className="text-gray-600 text-xs ">#{channelName}</div> */}
            </div>
          </div>
        </div>
        <div className={styles.icons}>
          {onExpandClick && (
            <Icon className={styles.expand} onClick={onExpandClick}>
              {expanded ? <FiMinimize /> : <FiMaximize />}
            </Icon>
          )}
          {manage && (
            <>
              {state === ThreadState.OPEN && (
                <Icon
                  onClick={() => {
                    onCloseThread();
                  }}
                >
                  <FiCheck />
                </Icon>
              )}
              {state === ThreadState.CLOSE && (
                <Icon
                  onClick={() => {
                    onReopenThread();
                  }}
                >
                  <FiRefreshCcw />
                </Icon>
              )}
            </>
          )}
          {onClose && (
            <Icon onClick={onClose} className={styles.close}>
              <FiX />
            </Icon>
          )}
        </div>
      </div>
    </StickyHeader>
  );
}
