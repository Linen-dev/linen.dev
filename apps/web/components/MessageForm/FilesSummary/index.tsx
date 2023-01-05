import React from 'react';
import styles from './index.module.scss';
import { UploadedFile } from '@linen/types'
import { copyToClipboard } from '@linen/utilities/clipboard';
import { Toast } from '@linen/ui'

interface Props {
  uploading?: boolean;
  progress: number;
  files: File[];
  uploads: UploadedFile[];
}

export default function FilesSummary({ uploading, progress, files, uploads }: Props) {
  const count = files.length
  if (count === 0) {
    return null;
  }
  return (
    <ul className={styles.list}>
      {uploading && <li className={styles.text}>{`Uploading... ${progress}%`}</li>}
      {uploads.map((file, index) => {
        return (
          <li key={file.id}>
            <div
              className={styles.file}
              onClick={() => {
                copyToClipboard(file.url)
                Toast.info('Copied url to clipboard.')
              }}
            >File {index + 1}</div>
          </li>
        )
      })}
    </ul>
  );
}
