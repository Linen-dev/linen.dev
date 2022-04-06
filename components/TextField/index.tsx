import React from 'react';
import Field from '../Field';
import Label from '../Label';
import TextInput from '../TextInput';

interface Props {
  label: string;
  id: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
}

export default function TextField({
  label,
  id,
  placeholder,
  defaultValue,
  required,
}: Props) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        id={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
      />
    </Field>
  );
}
