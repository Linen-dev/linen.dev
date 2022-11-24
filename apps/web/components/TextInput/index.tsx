import React from 'react';
import classNames from 'classnames';
import { Label } from '@linen/ui';
import styles from './index.module.scss';

interface Props {
  className?: string;
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
  autoFocus?: boolean;
  style?: object;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  onBlur?(event: React.ChangeEvent<HTMLInputElement>): void;
  onKeyDown?(event: React.KeyboardEvent<HTMLInputElement>): void;
}

function TextInput({
  className,
  type,
  id,
  name,
  placeholder,
  required,
  label,
  defaultValue,
  value,
  style,
  disabled = false,
  readOnly = false,
  icon,
  inputRef,
  onChange,
  onBlur,
  onKeyDown,
  autoFocus,
  ...rest
}: Props) {
  return (
    <>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={styles.container}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input
          ref={inputRef}
          className={classNames(styles.input, className)}
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
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          style={style}
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
