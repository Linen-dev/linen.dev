import React from 'react';
import Field from '../Field';
import Label from '../Label';
import ColorInput from '../ColorInput';

interface Props {
  label: string;
  id: string;
  defaultValue?: string;
}

export default function TextField({ label, id, defaultValue }: Props) {
  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      <ColorInput id={id} defaultValue={defaultValue} />
    </Field>
  );
}
