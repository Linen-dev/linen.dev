import React from 'react';
import classNames from 'classnames';
import { getColor } from '@linen/utilities/colors';
import { getLetter } from '@linen/utilities/string';
import styles from './index.module.scss';

interface Props {
  text: string;
}

export default function Symbol({ text }: Props) {
  const letter = getLetter(text || '');
  const color = getColor(letter);

  return (
    <div className={classNames(styles.symbol, styles[`color-${color}`])} />
  );
}
