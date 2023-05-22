import React from 'react';
import styles from './index.module.scss';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';

interface Props {
  id: string;
  disabled?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
  uploading?: boolean;
  progress?: number;
}

export default function FileUploadButton({
  id,
  disabled,
  onChange,
  uploading,
  progress,
}: Props) {
  return (
    <label className={styles.label} htmlFor={id}>
      <FiUploadCloud /> {!uploading ? 'Upload' : `Uploading... ${progress}%`}
      <input
        className={styles.input}
        type="file"
        id={id}
        name="files"
        onChange={onChange}
        multiple
        disabled={disabled}
      />
    </label>
  );
}
