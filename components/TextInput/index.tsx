import React from 'react';
import styles from './index.module.css';

interface Props {
  type?: string;
  id: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}

function TextInput({
  type,
  id,
  name,
  placeholder,
  required,
  defaultValue,
}: Props) {
  return (
    <input
      className={styles.input}
      type={type}
      id={id}
      name={id || name}
      placeholder={placeholder}
      required={required}
      defaultValue={defaultValue}
    />
  );
}

TextInput.defaultProps = {
  type: 'text',
};

export default TextInput;
