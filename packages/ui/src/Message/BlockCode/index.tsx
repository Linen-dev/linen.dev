import React from 'react';
import Code from '@/Code';
import { decodeHTML } from '@linen/utilities/string';
import {
  formatCode,
  isHighlighted,
  isFormattable,
  LANGUAGES,
} from './utilities';
import { copyToClipboard } from '@linen/utilities/clipboard';
import Toast from '@/Toast';

interface Props {
  value: string;
  language?: string;
  placeholder?: boolean;
}

function normalize(value: string, language?: string) {
  if (language && LANGUAGES.includes(language)) {
    return value.replace(new RegExp('^' + language + '\\s'), '').trim();
  }
  return value.trim();
}

export default function BlockCode({ value, language, placeholder }: Props) {
  const input = normalize(value, language);
  const content = decodeHTML(input);
  return (
    <Code
      block
      content={isFormattable(content) ? formatCode(content) : content}
      language={language}
      highlight={!placeholder && isHighlighted(value)}
      onClick={(content) => {
        copyToClipboard(content);
        Toast.success('Copied code to clipboard');
      }}
    />
  );
}
