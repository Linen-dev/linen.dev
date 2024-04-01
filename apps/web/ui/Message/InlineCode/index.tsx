import React from 'react';
import Code from '@/Code';
import { decodeHTML } from '@linen/utilities/string';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return <Code content={content} inline />;
}
