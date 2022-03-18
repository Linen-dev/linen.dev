import React from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import styles from './index.module.css';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
  text: string;
}

function dimensions(size) {
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

function Avatar({ src, alt, text, size }: Props) {
  if (!src) {
    return (
      <div className={classNames(styles.placeholder, styles[size])}>{text}</div>
    );
  }
  return (
    <div className={classNames(styles.avatar, styles[size])}>
      <Image
        className={classNames(styles.image, styles[size])}
        src={src}
        alt={alt}
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
