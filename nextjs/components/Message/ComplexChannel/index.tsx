import React from 'react';

interface Props {
  value: string;
}

export default function ComplexChannel({ value }: Props) {
  const [id, name] = value.split('|');
  return <strong>#{name || id}</strong>;
}
