import React from 'react';
import Component from '@/Image';
import styles from './index.module.scss';
import { getImageDimensionsFromUrl } from '@linen/utilities/files';

interface Props {
  src: string;
  alt?: string;
  onLoad?(): void;
  onClick?(src: string): void;
  isBot?: boolean;
}

export default function Image({ src, alt, onLoad, onClick, isBot }: Props) {
  const dimensions = getImageDimensionsFromUrl(src);
  return (
    <Component
      className={styles.image}
      width={dimensions?.width || 200}
      height={dimensions?.height || 200}
      src={src}
      alt={alt}
      onLoad={onLoad}
      onClick={onClick}
      isBot={isBot}
    />
  );
}
