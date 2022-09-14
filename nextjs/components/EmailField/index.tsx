import React from 'react';
import TextField from '../TextField';

interface Props {
  id: string;
  label: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
}

export default function EmailField({
  id,
  label,
  required,
  defaultValue,
  placeholder,
}: Props) {
  return (
    <TextField
      id={id}
      label={label}
      required={required}
      type="email"
      defaultValue={defaultValue}
      placeholder={placeholder}
    />
  );
}
