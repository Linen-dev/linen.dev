import React from 'react';
import Component from '@/Image';
import styles from './index.module.scss';

interface Props {
  src: string;
  alt?: string;
  onLoad?(): void;
  isBot?: boolean;
}

export default function Image({ src, alt, onLoad, isBot }: Props) {
  return (
    <Component
      className={styles.image}
      height={200}
      width={200}
      src={src}
      alt={alt}
      onLoad={onLoad}
      isBot={isBot}
    />
  );
}
