import React, { useEffect, useState, memo } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { normalizeUrl } from './utilities/url';
import { getColor } from './utilities/color';
import { getLetter } from './utilities/string';
import preload, { cache } from '@/Image/utilities/preload';

interface Props {
  className?: string;
  src?: string | null;
  text?: string | null;
  size?: Size;
  shadow?: Shadow;
  placeholder?: boolean;
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

const TextAvatar = memo(function TextAvatar({
  className,
  size,
  shadow,
  text,
}: Props) {
  const letter = getLetter(text || '');
  const color = getColor(letter);
  return (
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
  );
});

const ImageAvatar = memo(function ImageAvatar({
  className,
  src,
  size,
  shadow,
  text,
}: Props) {
  if (!src) {
    return null;
  }
  return (
    <img
      className={classNames(className, styles.image, size && styles[size], {
        [styles.shadow]: shadow === 'sm',
      })}
      src={normalizeUrl(src)}
      alt={text || 'avatar'}
      height={dimensions(size)}
      width={dimensions(size)}
    />
  );
});

function Avatar({
  className,
  src,
  text = 'u',
  size,
  shadow,
  placeholder,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (src && !placeholder && !loaded) {
      preload(normalizeUrl(src)).then(() => {
        if (mounted) {
          setLoaded(true);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [loaded, placeholder]);

  const preloaded = src && cache[src];

  if (loaded || preloaded) {
    return (
      <ImageAvatar
        className={className}
        text={text}
        size={size}
        shadow={shadow}
        src={src}
      />
    );
  }

  return (
    <TextAvatar className={className} text={text} size={size} shadow={shadow} />
  );
}

Avatar.defaultProps = {
  size: 'md',
  shadow: 'sm',
};

export default memo(Avatar);
