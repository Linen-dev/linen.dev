import React from 'react';

interface Props {
  value: string;
}

export default function Channel({ value }: Props) {
  const [id, name] = value.split('|');
  return <strong>#{name || id}</strong>;
}
