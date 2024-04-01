import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { FiUploadCloud } from '@react-icons/all-files/fi/FiUploadCloud';

interface Props {
  id: string;
  disabled?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
  uploading?: boolean;
  progress?: number;
  accept: string;
}

export default function FileUploadButton({
  id,
  disabled,
  onChange,
  uploading,
  progress,
  accept,
}: Props) {
  return (
    <label
      className={classNames(styles.label, { [styles.disabled]: disabled })}
      htmlFor={id}
    >
      <FiUploadCloud /> {!uploading ? 'Upload' : `Uploading... ${progress}%`}
      <input
        className={styles.input}
        type="file"
        id={id}
        name="files"
        onChange={onChange}
        multiple
        disabled={disabled}
        accept={accept}
      />
    </label>
  );
}
