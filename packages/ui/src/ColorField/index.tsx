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
  onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
}

export default function ColorField({
  label,
  id,
  defaultValue,
  required,
  disabled = false,
  readOnly = false,
  onChange,
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
        onChange={onChange}
      />
    </Field>
  );
}
