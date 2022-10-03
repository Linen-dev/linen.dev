import React from 'react';
import Field from '../Field';
import Label from '../Label';
import TextInput from '../TextInput';

interface Props {
  className?: string;
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  onBlur?(event: React.ChangeEvent<HTMLInputElement>): void;
  onKeyDown?(event: React.KeyboardEvent<HTMLInputElement>): void;
}

export default function TextField({
  className,
  label,
  id,
  type,
  placeholder,
  defaultValue,
  required,
  disabled = false,
  readOnly = false,
  onBlur,
  onKeyDown,
  autoFocus,
  ...rest
}: Props) {
  return (
    <Field>
      {label && <Label htmlFor={id}>{label}</Label>}
      <TextInput
        className={className}
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
        {...rest}
      />
    </Field>
  );
}
