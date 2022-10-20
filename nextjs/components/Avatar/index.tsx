import React, { useState } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import styles from './index.module.scss';
import { normalizeUrl } from 'utilities/url';

interface Props {
  src?: string | null;
  alt?: string | null;
  text?: string;
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

function Avatar({ src, alt, text = 'u', size, shadow }: Props) {
  const [hasError, setHasError] = useState(false);

  return (
    <>
      {!src || hasError ? (
        <div
          className={classNames(styles.placeholder, {
            [styles.size]: size,
            [styles.shadow]: shadow === 'sm',
          })}
        >
          {text}
        </div>
      ) : (
        <div
          className={classNames(styles.avatar, {
            [styles.size]: size,
            [styles.shadow]: shadow === 'sm',
          })}
        >
          <Image
            className={classNames(styles.image, { [styles.size]: size })}
            src={normalizeUrl(src)}
            onError={() => {
              setHasError(true);
            }}
            alt={alt || 'avatar'}
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
