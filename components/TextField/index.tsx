import React from 'react';
import Field from '../Field';
import Label from '../Label';
import TextInput from '../TextInput';

interface Props {
  label?: string;
  id: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function TextField({
  label,
  id,
  type,
  placeholder,
  defaultValue,
  required,
  disabled = false,
  readOnly = false,
}: Props) {
  return (
    <Field>
      {label && <Label htmlFor={id}>{label}</Label>}
      <TextInput
        id={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
      />
    </Field>
  );
}
