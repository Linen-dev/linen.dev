import React from 'react';
import classNames from 'classnames';
import Label from '../Label';
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
  autoComplete?: string;
  autoFocus?: boolean;
  style?: object;
  title?: string;
  pattern?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
  onInput?(event: React.ChangeEvent<HTMLInputElement>): void;
  onBlur?(event: React.ChangeEvent<HTMLInputElement>): void;
  onKeyDown?(event: React.KeyboardEvent<HTMLInputElement>): void;
  onKeyUp?(event: React.KeyboardEvent<HTMLInputElement>): void;
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
  onInput,
  onBlur,
  onKeyDown,
  onKeyUp,
  autoComplete,
  autoFocus,
  title,
  pattern,
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
          onInput={onInput}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          style={style}
          title={title}
          pattern={pattern}
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
