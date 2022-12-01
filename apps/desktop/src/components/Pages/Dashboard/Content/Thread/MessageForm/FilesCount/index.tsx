import React from 'react';
import styles from './index.module.scss';

interface Props {
  uploading: boolean;
  progress: number;
  count: number;
}

export default function FilesCount({ uploading, progress, count }: Props) {
  if (count === 0) {
    return null;
  }
  return (
    <div className={styles.text}>
      {uploading ? `Uploading... ${progress}%` : `Files: ${count}`}
    </div>
  );
}
