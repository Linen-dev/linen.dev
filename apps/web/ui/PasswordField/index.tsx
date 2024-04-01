import React from 'react';
import Field from '@/Field';
import Label from '@/Label';
import PasswordInput from '@/PasswordInput';

interface Props {
  id: string;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PasswordField({
  label,
  className,
  id,
  placeholder,
  required,
}: Props) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <PasswordInput
        className={className}
        id={id}
        placeholder={placeholder}
        required={required}
      />
    </Field>
  );
}
