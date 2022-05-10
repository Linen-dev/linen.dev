import React from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import styles from './index.module.css';
import { normalizeUrl } from 'utilities/url';

interface Props {
  src?: string | null;
  alt?: string | null;
  text?: string;
  size?: Size;
}

export enum Size {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
}

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

function Avatar({ src, alt, text = 'u', size }: Props) {
  if (!src) {
    return (
      <div className={classNames(styles.placeholder, size && styles[size])}>
        {text}
      </div>
    );
  }
  return (
    <div className={classNames(styles.avatar, size && styles[size])}>
      <Image
        className={classNames(styles.image, size && styles[size])}
        src={normalizeUrl(src)}
        alt={alt || 'avatar'}
        height={dimensions(size)}
        width={dimensions(size)}
      />
    </div>
  );
}

Avatar.defaultProps = {
  size: 'md',
};

export default Avatar;
