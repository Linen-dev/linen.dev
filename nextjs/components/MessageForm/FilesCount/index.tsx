import React from 'react';
import styles from './index.module.scss';

interface Props {
  uploading: boolean;
  count: number;
}

export default function FilesCount({ uploading, count }: Props) {
  if (count === 0) {
    return null;
  }
  return (
    <div className={styles.text}>
      {uploading ? 'Uploading...' : `Files: ${count}`}
    </div>
  );
}
