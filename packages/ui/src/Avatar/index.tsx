import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { normalizeUrl } from './utilities/url';
import { getColor } from './utilities/color';
import { getLetter } from './utilities/string';

interface Props {
  src?: string | null;
  text?: string | null;
  size?: Size;
  shadow?: Shadow;
}

export type Size = 'sm' | 'md' | 'lg';
export type Shadow = 'none' | 'sm';

function dimensions(size?: Size) {
  switch (size) {
    case 'sm':
      return 26;
    case 'md':
      return 36;
    case 'lg':
      return 38;
    default:
      return 32;
  }
}

function Avatar({ src, text = 'u', size, shadow }: Props) {
  const [error, setError] = useState(false);

  const letter = getLetter(text || '');
  const color = getColor(letter);

  return (
    <>
      {!src || error ? (
        <div
          className={classNames(styles.placeholder, size && styles[size], {
            [styles.shadow]: shadow === 'sm',
            [styles[`color-${color}`]]: color,
          })}
        >
          {letter}
        </div>
      ) : (
        <div
          className={classNames(styles.avatar, size && styles[size], {
            [styles.shadow]: shadow === 'sm',
          })}
        >
          <img
            className={classNames(styles.image, size && styles[size])}
            src={normalizeUrl(src)}
            onError={() => {
              setError(true);
            }}
            alt={text || 'avatar'}
            height={dimensions(size)}
            width={dimensions(size)}
          />
        </div>
      )}
    </>
  );
}

Avatar.defaultProps = {
  size: 'md',
  shadow: 'sm',
};

export default Avatar;
