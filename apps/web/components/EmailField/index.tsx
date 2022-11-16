import React from 'react';
import TextField from '../TextField';

interface Props {
  id: string;
  className?: string;
  label?: string;
  required?: boolean;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function EmailField({
  id,
  className,
  label,
  required,
  value,
  defaultValue,
  placeholder,
  onChange,
}: Props) {
  return (
    <TextField
      id={id}
      className={className}
      label={label}
      required={required}
      type="email"
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
