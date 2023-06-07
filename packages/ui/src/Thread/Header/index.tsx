import React from 'react';
import classNames from 'classnames';
import Title from './Title';
import Icon from '@/Icon';
import StickyHeader from '@/StickyHeader';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';
import { ThreadState, SerializedThread } from '@linen/types';
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
            {onClose && (
              <div className={classNames({ [styles.mobile]: !!onExpandClick })}>
                <Icon onClick={onClose}>
                  <FiChevronLeft />
                </Icon>
              </div>
            )}
            {onExpandClick && (
              <div className={styles.desktop}>
                <Icon className={styles.expand} onClick={onExpandClick}>
                  <FiChevronLeft />
                </Icon>
              </div>
            )}
            <div>
              <Title
                title={title}
                state={state}
                manage={manage}
                onSetTitle={onSetTitle}
              />
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
