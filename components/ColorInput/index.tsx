import React from 'react';
import styles from './index.module.css';

interface Props {
  id: string;
  defaultValue?: string;
  required?: boolean;
}

function ColorInput({ id, defaultValue, required }: Props) {
  return (
    <input
      type="color"
      id={id}
      className={styles.input}
      defaultValue={defaultValue}
      required={required}
    />
  );
}

export default ColorInput;
