import React, { useState } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import styles from './index.module.scss';
import { normalizeUrl } from 'utilities/url';
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
  const [hasError, setHasError] = useState(false);

  const letter = getLetter(text || '');

  return (
    <>
      {!src || hasError ? (
        <div
          className={classNames(styles.placeholder, size && styles[size], {
            [styles.shadow]: shadow === 'sm',
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
          <Image
            className={classNames(styles.image, size && styles[size])}
            src={normalizeUrl(src)}
            onError={() => {
              setHasError(true);
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
