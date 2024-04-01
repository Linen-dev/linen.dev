import React from 'react';
import styles from './index.module.scss';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';
import Tooltip from '@/Tooltip';

export default function FindCommunityLink() {
  return (
    <Tooltip text="Find Community" position="right">
      <a className={styles.link} href="https://linen.dev/communities">
        <FiSearch />
      </a>
    </Tooltip>
  );
}
