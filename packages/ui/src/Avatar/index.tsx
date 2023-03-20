import React, { useEffect, useState, memo } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { normalizeUrl } from './utilities/url';
import { getColor } from './utilities/color';
import { getLetter } from './utilities/string';
import preload, { cache } from '../Image/utilities/preload';
import { useInView } from 'react-intersection-observer';

interface Props {
  className?: string;
  src?: string | null;
  text?: string | null;
  size?: Size;
  shadow?: Shadow;
  placeholder?: boolean;
  innerRef?: any;
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
  innerRef,
}: Props) {
  const letter = getLetter(text || '');
  const color = getColor(letter);
  return (
    <div
      ref={innerRef}
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
  innerRef,
}: Props) {
  if (!src) {
    return null;
  }
  return (
    <img
      ref={innerRef}
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
  const { ref, inView } = useInView();

  useEffect(() => {
    let mounted = true;
    if (src && inView && !loaded) {
      preload(normalizeUrl(src)).then(() => {
        console.log(src);
        if (mounted) {
          setLoaded(true);
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [loaded, inView]);

  if (placeholder) {
    return (
      <TextAvatar
        innerRef={ref}
        className={className}
        text={text}
        size={size}
        shadow={shadow}
      />
    );
  }

  const preloaded = src && cache[src];

  if (loaded || preloaded) {
    return (
      <ImageAvatar
        innerRef={ref}
        className={className}
        text={text}
        size={size}
        shadow={shadow}
        src={src}
      />
    );
  }

  return (
    <TextAvatar
      innerRef={ref}
      className={className}
      text={text}
      size={size}
      shadow={shadow}
    />
  );
}

Avatar.defaultProps = {
  size: 'md',
  shadow: 'sm',
};

export default memo(Avatar);
