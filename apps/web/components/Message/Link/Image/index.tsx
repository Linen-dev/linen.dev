import React from 'react';
import { Image } from '@linen/ui';
import styles from './index.module.scss';

interface Props {
  src: string;
  alt?: string;
}

export default function Component({ src, alt }: Props) {
  return <Image className={styles.image} src={src} alt={alt} />;
}
