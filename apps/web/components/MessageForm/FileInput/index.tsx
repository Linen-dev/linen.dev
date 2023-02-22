import React from 'react';
import styles from './index.module.scss';
import { FiUpload } from '@react-icons/all-files/fi/FiUpload';

interface Props {
  id: string;
  disabled?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function FileInput({ id, disabled, onChange }: Props) {
  return (
    <label className={styles.label} htmlFor={id}>
      <FiUpload />
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
