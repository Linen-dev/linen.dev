import React from 'react';
import classNames from 'classnames';
import Title from './Title';
import Icon from '@/Icon';
import StickyHeader from '@/StickyHeader';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiX } from '@react-icons/all-files/fi/FiX';
import { SerializedThread } from '@linen/types';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  manage: boolean;
  expanded?: boolean;
  breadcrumb?: React.ReactNode;
  onClose?(): void;
  onExpandClick?(): void;
  onSetTitle(title: string): void;
  sidebar?: boolean;
}

function Navigation({
  breadcrumb,
  onClose,
  onExpandClick,
}: {
  breadcrumb?: React.ReactNode;
  onClose?(): void;
  onExpandClick?(): void;
}) {
  if (breadcrumb) {
    return <>{breadcrumb}</>;
  }
  return (
    <>
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
    </>
  );
}

export default function Header({
  thread,
  manage,
  expanded,
  breadcrumb,
  onClose,
  onExpandClick,
  onSetTitle,
  sidebar,
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
            <Navigation
              breadcrumb={breadcrumb}
              onClose={onClose}
              onExpandClick={onExpandClick}
            />
            <div>
              <Title
                title={title}
                state={state}
                manage={manage}
                onSetTitle={onSetTitle}
              />
              <div className={styles.channelName}>
                # {' ' + thread.channel?.channelName}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.icons}>
          {sidebar && (
            <Icon onClick={onClose}>
              <FiX />
            </Icon>
          )}
        </div>
      </div>
    </StickyHeader>
  );
}
