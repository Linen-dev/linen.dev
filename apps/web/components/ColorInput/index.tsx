import React from 'react';
import styles from './index.module.css';

interface Props {
  id: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
}

function ColorInput({
  id,
  defaultValue,
  required,
  disabled = false,
  readOnly = false,
  onChange,
}: Props) {
  return (
    <input
      type="color"
      id={id}
      className={styles.input}
      defaultValue={defaultValue}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      onChange={onChange}
    />
  );
}

export default ColorInput;
