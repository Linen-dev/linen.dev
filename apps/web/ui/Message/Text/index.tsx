import React from 'react';
import { decodeHTML } from '@linen/utilities/string';

interface Props {
  value: string;
}

export default function Text({ value }: Props) {
  return <>{decodeHTML(value)}</>;
}
