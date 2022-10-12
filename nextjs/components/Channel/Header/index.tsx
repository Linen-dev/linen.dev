import React from 'react';
import StickyHeader from 'components/StickyHeader';
import { FiHash } from 'react-icons/fi';
import styles from './index.module.css';

interface Props {
  channelName: string;
}

export default function Header({ channelName }: Props) {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiHash /> {channelName}
      </div>
    </StickyHeader>
  );
}
