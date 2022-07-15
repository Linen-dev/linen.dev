import React from 'react';
import Field from '../Field';
import Label from '../Label';
import PasswordInput from '../PasswordInput';

interface Props {
  label: string;
  id: string;
  placeholder?: string;
  required?: boolean;
}

export default function TextField({ label, id, placeholder, required }: Props) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <PasswordInput id={id} placeholder={placeholder} required={required} />
    </Field>
  );
}
