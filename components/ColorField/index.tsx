import React from 'react';
import Field from '../Field';
import Label from '../Label';
import ColorInput from '../ColorInput';

interface Props {
  label?: string;
  id: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function TextField({
  label,
  id,
  defaultValue,
  required,
  disabled = false,
  readOnly = false,
}: Props) {
  return (
    <Field>
      {label && <Label htmlFor={id}>{label}</Label>}
      <ColorInput
        id={id}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
      />
    </Field>
  );
}
