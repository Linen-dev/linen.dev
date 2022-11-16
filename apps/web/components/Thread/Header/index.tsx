import React from 'react';
import Title from './Title';
import StickyHeader from 'components/StickyHeader';
import classNames from 'classnames';
import { ThreadState } from '@prisma/client';
import { GoCheck, GoChevronLeft, GoX, GoSync } from 'react-icons/go';
import { SerializedThread } from 'serializers/thread';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  channelName: string;
  manage: boolean;
  onClose?(): void;
  onCloseThread(): void;
  onReopenThread(): void;
  onSetTitle(title: string): void;
}

export default function Header({
  thread,
  channelName,
  manage,
  onClose,
  onCloseThread,
  onReopenThread,
  onSetTitle,
}: Props) {
  const { title, state } = thread;
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
              manage={manage}
              onSetTitle={onSetTitle}
            />
            <div className="text-gray-600 text-xs ">#{channelName}</div>
          </div>
        </div>
        <div className={styles.icons}>
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
