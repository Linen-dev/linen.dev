import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { normalizeUrl } from './utilities/url';
import { getColor } from './utilities/color';
import { getLetter } from './utilities/string';

interface Props {
  className?: string;
  src?: string | null;
  text?: string | null;
  size?: Size;
  shadow?: Shadow;
  Image?: any;
}

export type Size = 'sm' | 'md';
export type Shadow = 'none' | 'sm';

function dimensions(size?: Size) {
  switch (size) {
    case 'sm':
      return 26;
    default:
      return 36;
  }
}

function Avatar({ className, src, text = 'u', size, shadow, Image }: Props) {
  const [error, setError] = useState(false);

  const letter = getLetter(text || '');
  const color = getColor(letter);

  function renderImage({ src }: { src: string }) {
    const props = {
      className: classNames(styles.image, size && styles[size]),
      src: normalizeUrl(src),
      onError: () => {
        setError(true);
      },
      alt: text || 'avatar',
      height: dimensions(size),
      width: dimensions(size),
    };
    if (Image) {
      return <Image {...props} />;
    }
    return <img {...props} />;
  }

  return (
    <>
      {!src || error ? (
        <div
          className={classNames(
            className,
            styles.placeholder,
            size && styles[size],
            {
              [styles.shadow]: shadow === 'sm',
              [styles[`color-${color}`]]: color,
            }
          )}
        >
          {letter}
        </div>
      ) : (
        <div
          className={classNames(
            className,
            styles.avatar,
            size && styles[size],
            {
              [styles.shadow]: shadow === 'sm',
            }
          )}
        >
          {renderImage({ src })}
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
