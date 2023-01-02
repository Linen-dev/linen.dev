import React from 'react';
import styles from './index.module.scss';
import { UploadedFile } from '@linen/types'
import { copyToClipboard } from '@linen/utilities/clipboard';
import { Toast } from '@linen/ui'

interface Props {
  uploading: boolean;
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
    <div className={styles.text}>
      {uploading ? `Uploading... ${progress}%` : `Files: ${count}`}
      {uploads.length > 0 && (
        <ul>
          {uploads.map((file) => {
            return (
              <li key={file.id}>
                <span
                  className={styles.file}
                  onClick={() => {
                    copyToClipboard(file.url)
                    Toast.info('Copied url to clipboard.')
                  }}
                >{file.id}</span>
              </li>
            )
          })}
        </ul>
      )}
      
    </div>
  );
}
