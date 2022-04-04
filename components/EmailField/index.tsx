import React from 'react';
import TextField from '../TextField';

interface Props {
  id: string;
  label: string;
  required?: boolean;
}

export default function EmailField({ id, label, required }: Props) {
  return <TextField id={id} label={label} required={required} type="email" />;
}
