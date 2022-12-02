import React from 'react';
import Component from '../../../Image';
import styles from './index.module.scss';

interface Props {
  src: string;
  alt?: string;
}

export default function Image({ src, alt }: Props) {
  return <Component className={styles.image} src={src} alt={alt} />;
}
