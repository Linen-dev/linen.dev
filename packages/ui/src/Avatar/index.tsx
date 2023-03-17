import React, { useEffect, useState, memo } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { normalizeUrl } from './utilities/url';
import { getColor } from './utilities/color';
import { getLetter } from './utilities/string';
import preload from '../Image/utilities/preload';
import { useInView } from 'react-intersection-observer';

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

function TextAvatar({ className, size, shadow, text }: Props) {
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
}

function ImageAvatar({ className, src, size, shadow, text }: Props) {
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
}

function Avatar({
  className,
  src,
  text = 'u',
  size,
  shadow,
  placeholder,
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const { ref, inView } = useInView({ threshold: 0, skip: !src });

  useEffect(() => {
    let mounted = true;
    if (src && !loaded && inView) {
      preload(normalizeUrl(src)).then(() => {
        if (mounted) {
          setLoaded(true);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [inView, loaded]);

  if (placeholder) {
    return (
      <div ref={ref}>
        <TextAvatar
          className={className}
          text={text}
          size={size}
          shadow={shadow}
        />
      </div>
    );
  }

  if (loaded) {
    return (
      <div ref={ref}>
        <ImageAvatar
          className={className}
          text={text}
          size={size}
          shadow={shadow}
          src={src}
        />
      </div>
    );
  }

  return (
    <div ref={ref}>
      <TextAvatar
        className={className}
        text={text}
        size={size}
        shadow={shadow}
      />
    </div>
  );
}

Avatar.defaultProps = {
  size: 'md',
  shadow: 'sm',
};

export default memo(Avatar);
