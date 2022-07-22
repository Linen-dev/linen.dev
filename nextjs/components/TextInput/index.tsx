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
  value?: string;
  disabled?: boolean;
  readOnly?: boolean;
  icon?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
}

function TextInput({
  type,
  id,
  name,
  placeholder,
  required,
  label,
  defaultValue,
  value,
  disabled = false,
  readOnly = false,
  icon,
  inputRef,
  onChange,
  ...rest
}: Props) {
  return (
    <>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={styles.container}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input
          ref={inputRef}
          className={styles.input}
          type={type}
          id={id}
          name={id || name}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          onChange={onChange}
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
