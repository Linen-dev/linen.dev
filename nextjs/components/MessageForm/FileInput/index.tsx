import React from 'react';
import styles from './index.module.scss';
import { FiUpload } from 'react-icons/fi';

interface Props {
  disabled: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function FileInput({ disabled, onChange }: Props) {
  return (
    <label className={styles.label} htmlFor="files">
      <FiUpload />
      <input
        className={styles.input}
        type="file"
        id="files"
        name="files"
        onChange={onChange}
        multiple
        disabled={disabled}
      />
    </label>
  );
}
