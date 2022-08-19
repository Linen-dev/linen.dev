import React from 'react';
import Field from 'components/Field';
import Label from 'components/Label';
import Textarea from 'components/Textarea';

interface Props {
  label?: string;
  name: string;
}

function MessageField({ label, name }: Props) {
  return (
    <Field>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Textarea name={name} />
    </Field>
  );
}

export default MessageField;
