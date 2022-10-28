import React from 'react';
import StickyHeader from 'components/StickyHeader';
import { FiHash } from 'react-icons/fi';
import { Mode } from 'hooks/mode';
import styles from './index.module.css';
import classNames from 'classnames';

interface Props {
  className?: string;
  channelName: string;
  children: React.ReactNode;
  mode: Mode;
}

export default function Header({
  className,
  channelName,
  children,
  mode,
}: Props) {
  return (
    <StickyHeader
      className={classNames(styles.header, className, {
        [styles.dimmed]: mode === Mode.Drag,
      })}
    >
      <div className={styles.title}>
        <FiHash /> {channelName}
      </div>
      {children}
    </StickyHeader>
  );
}
