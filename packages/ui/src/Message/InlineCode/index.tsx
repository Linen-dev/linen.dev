import React from 'react';
import Code from '@/Code';
import { decodeHTML } from '@linen/utilities/string';
import { copyToClipboard } from '@linen/utilities/clipboard';
import Toast from '@/Toast';

interface Props {
  value: string;
}

export default function InlineCode({ value }: Props) {
  const input = value.trim();
  const content = decodeHTML(input);
  return (
    <Code
      onClick={(content) => {
        copyToClipboard(content);
        Toast.success('Copied code to clipboard');
      }}
      content={content}
      inline
    />
  );
}
