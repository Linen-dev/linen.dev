import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { normalizeUrl } from './utilities/url';
import preload, { cache } from '@/Image/utilities/preload';
import { getColor } from '@linen/utilities/colors';
import { getLetter } from '@linen/utilities/string';

interface Props {
  className?: string;
  src?: string | null;
  text?: string | null;
  size?: Size;
  shadow?: Shadow;
  placeholder?: boolean;
  active?: boolean;
  onClick?(): void;
}

export type Size = 'sm' | 'md' | 'xl';
export type Shadow = 'none' | 'sm';

function dimensions(size?: Size) {
  switch (size) {
    case 'sm':
      return 26;
    default:
      return 36;
  }
}

const TextAvatar = function TextAvatar({
  className,
  size,
  shadow,
  text,
  active,
  onClick,
}: Props) {
  const letter = getLetter(text || '');
  const color = getColor(letter);
  return (
    <div
      className={classNames(
        className,
        styles.placeholder,
        size && styles[size],
        onClick && styles.pointer,
        {
          [styles.shadow]: shadow === 'sm',
          [styles[`color-${color}`]]: color,
          [styles.active]: active,
        }
      )}
    >
      {letter}
    </div>
  );
};

const ImageAvatar = function ImageAvatar({
  className,
  src,
  size,
  shadow,
  text,
  active,
  onClick,
}: Props) {
  if (!src) {
    return null;
  }
  return (
    <picture className={classNames({ [styles.active]: active })}>
      <img
        className={classNames(className, styles.image, size && styles[size], {
          [styles.shadow]: shadow === 'sm',
          [styles.pointer]: !!onClick,
        })}
        src={normalizeUrl(src)}
        alt={text || 'avatar'}
        height={dimensions(size)}
        width={dimensions(size)}
      />
    </picture>
  );
};

function Avatar({
  className,
  src,
  text = 'u',
  size,
  shadow,
  placeholder,
  active,
  isBot,
  onClick,
}: Props & { isBot?: boolean }) {
  const preloaded = !!src && !!cache[src];
  const [loaded, setLoaded] = useState(preloaded);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (src && !placeholder && !loaded) {
      preload(normalizeUrl(src))
        .then(() => {
          if (mounted) {
            setLoaded(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setError(true);
          }
        });
    }
    return () => {
      mounted = false;
    };
  }, [loaded, placeholder]);

  if (isBot) {
    return !!src ? (
      <ImageAvatar
        className={className}
        text={text}
        size={size}
        shadow={shadow}
        src={src}
        active={active}
        onClick={onClick}
      />
    ) : (
      <TextAvatar
        className={className}
        text={text}
        size={size}
        shadow={shadow}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (error) {
    return (
      <TextAvatar
        className={className}
        text={text}
        size={size}
        shadow={shadow}
        active={active}
        onClick={onClick}
      />
    );
  }

  if (loaded) {
    return (
      <ImageAvatar
        className={className}
        text={text}
        size={size}
        shadow={shadow}
        src={src}
        active={active}
        onClick={onClick}
      />
    );
  }

  return (
    <TextAvatar
      className={className}
      text={text}
      size={size}
      shadow={shadow}
      active={active}
      onClick={onClick}
    />
  );
}

Avatar.defaultProps = {
  size: 'md',
  shadow: 'sm',
};

export default Avatar;
