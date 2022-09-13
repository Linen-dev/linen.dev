import React from 'react';
import styles from './index.module.css';

interface Props {
  checked?: boolean;
  onChange(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function Checkbox({ checked, onChange }: Props) {
  return (
    <input
      checked={checked}
      className={styles.checkbox}
      type="checkbox"
      onChange={onChange}
    />
  );
}
