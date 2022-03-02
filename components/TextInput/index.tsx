import React from 'react';
import styles from './index.module.css';

interface Props {
  id: string;
  placeholder?: string;
}

function TextInput({ id, placeholder }: Props) {
  return (
    <input
      className={styles.input}
      type="text"
      id={id}
      placeholder={placeholder}
    />
  );
}

export default TextInput;
