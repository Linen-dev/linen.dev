import React from 'react';
import Label from '../Label';
import styles from './index.module.css';

interface Props {
  type?: string;
  id: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
}

function TextInput({
  type,
  id,
  name,
  placeholder,
  required,
  label,
  defaultValue,
  disabled = false,
  readOnly = false,
  icon,
  ...rest
}: Props) {
  return (
    <>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={styles.container}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input
          className={styles.input}
          type={type}
          id={id}
          name={id || name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          disabled={disabled}
          readOnly={readOnly}
          {...rest}
        />
      </div>
    </>
  );
}

TextInput.defaultProps = {
  type: 'text',
};

export default TextInput;
