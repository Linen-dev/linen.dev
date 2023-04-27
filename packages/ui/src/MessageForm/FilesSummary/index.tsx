import React from 'react';
import styles from './index.module.scss';
import { UploadedFile } from '@linen/types';
import { copyToClipboard } from '@linen/utilities/clipboard';
import Toast from '../../Toast';

interface Props {
  uploading?: boolean;
  progress: number;
  uploads: UploadedFile[];
}

export default function FilesSummary({ uploading, progress, uploads }: Props) {
  if (!uploading && uploads.length === 0) {
    return null;
  }
  return (
    <ul className={styles.list}>
      {uploading && (
        <li className={styles.text}>{`Uploading... ${progress}%`}</li>
      )}
      {uploads.map((file, index) => {
        return (
          <li key={file.id}>
            <div
              className={styles.file}
              onClick={() => {
                copyToClipboard(file.url);
                Toast.success('Copied to clipboard');
              }}
            >
              File {index + 1}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
