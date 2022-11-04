import React from 'react';
import styles from './index.module.scss';
import { FiUpload } from 'react-icons/fi';

interface Props {
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function FileInput({ onChange }: Props) {
  return (
    <label className={styles.label} htmlFor="file">
      <FiUpload />
      <input
        className={styles.input}
        type="file"
        id="file"
        name="file"
        onChange={onChange}
      />
    </label>
  );
}
