import React from 'react';
import styles from './index.module.css';

interface Props {
  type?: string;
  id: string;
  placeholder?: string;
}

function TextInput({ type, id, placeholder }: Props) {
  return (
    <input
      className={styles.input}
      type={type}
      id={id}
      placeholder={placeholder}
    />
  );
}

TextInput.defaultProps = {
  type: 'text',
};

export default TextInput;
