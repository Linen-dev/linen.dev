import React from 'react';

interface Props {
  value: string;
}

export default function BasicChannel({ value }: Props) {
  return <strong>@{value}</strong>;
}
