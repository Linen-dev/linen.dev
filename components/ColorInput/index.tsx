import React from 'react';
import styles from './index.module.css';

interface Props {
  id: string;
  defaultValue?: string;
}

function ColorInput({ id, defaultValue }: Props) {
  return (
    <input
      type="color"
      id={id}
      className={styles.input}
      defaultValue={defaultValue}
    />
  );
}

export default ColorInput;
