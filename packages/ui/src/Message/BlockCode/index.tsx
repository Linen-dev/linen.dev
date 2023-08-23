import React from 'react';
import classNames from 'classnames';
import Code from '@/Code';
import { decodeHTML } from '@linen/utilities/string';
import {
  formatCode,
  isHighlighted,
  isFormattable,
  LANGUAGES,
} from './utilities';
import styles from './index.module.scss';

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
      className={classNames(styles.code, styles.block)}
      content={isFormattable(content) ? formatCode(content) : content}
      language={language}
      highlight={!placeholder && isHighlighted(value)}
    />
  );
}
