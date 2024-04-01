import React from 'react';
import classNames from 'classnames';
import Component from '@/Image';
import styles from './index.module.scss';
import { getWidthHeight } from './utilities/image';

interface Props {
  src: string;
  alt?: string;
  onLoad?(): void;
  onClick?(src: string): void;
  isBot?: boolean;
}

export default function Image({ src, alt, onLoad, onClick, isBot }: Props) {
  const { width, height } = getWidthHeight(src);
  return (
    <Component
      className={classNames(styles.image, {
        [styles.static]: width === 200 && height === 200,
      })}
      width={width}
      height={height}
      src={src}
      alt={alt}
      onLoad={onLoad}
      onClick={onClick}
      isBot={isBot}
    />
  );
}
