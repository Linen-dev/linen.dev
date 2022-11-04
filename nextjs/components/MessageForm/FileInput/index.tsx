import React from 'react';
import styles from './index.module.scss';
import { FiUpload } from 'react-icons/fi';

export default function FileInput() {
  return (
    <label className={styles.label} htmlFor="file">
      <FiUpload />
      <input className={styles.input} type="file" id="file" name="file" />
    </label>
  );
}
