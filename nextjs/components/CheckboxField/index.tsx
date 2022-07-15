import React, { useState } from 'react';
import Field from '../Field';
import Label from '../Label';
import { Checkbox } from '@mantine/core';

interface Props {
  label?: string;
  id: string;
  checked?: boolean;
}

export default function CheckboxField({ label, id, checked }: Props) {
  const [_checked, setChecked] = useState(checked || false);

  return (
    <Field>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Checkbox
        id={id}
        checked={_checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
        label={_checked ? 'Enabled' : 'Disabled'}
      />
    </Field>
  );
}
