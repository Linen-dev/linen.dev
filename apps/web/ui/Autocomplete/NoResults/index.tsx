import React from 'react';
import styles from './index.module.scss';
import { FiSearch } from '@react-icons/all-files/fi/FiSearch';

interface Props {
  search: string;
}

export default function NoResults({ search }: Props) {
  return (
    <div className={styles.container}>
      <FiSearch className={styles.icon} />
      <h2 className={styles.header}>No results for &quot;{search}&quot;</h2>
      <p className={styles.description}>
        Double check your search for any typos or spelling errors - or try
        different keywords.
      </p>
    </div>
  );
}
