import React from 'react';
import classNames from 'classnames';
import Title from './Title';
import Icon from '@linen/ui/Icon';
import StickyHeader from '@linen/ui/StickyHeader';
import { ThreadState } from '@linen/database';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
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
    <StickyHeader
      className={classNames({
        [styles.expanded]: expanded,
      })}
    >
      <div className={styles.container}>
        <div className={styles.center}>
          <div className={styles.header}>
            <div className={styles.mobile}>
              {onClose && (
                <Icon onClick={onClose}>
                  <FiChevronLeft />
                </Icon>
              )}
            </div>
            <div className={styles.desktop}>
              {onExpandClick && (
                <Icon className={styles.expand} onClick={onExpandClick}>
                  {expanded ? <FiChevronRight /> : <FiChevronLeft />}
                </Icon>
              )}
            </div>
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
          {manage && (
            <Icon
              active={state === ThreadState.CLOSE}
              onClick={() => {
                if (state === ThreadState.OPEN) {
                  onCloseThread();
                }
                if (state === ThreadState.CLOSE) {
                  onReopenThread();
                }
              }}
            >
              <FiCheck />
            </Icon>
          )}
        </div>
      </div>
    </StickyHeader>
  );
}
