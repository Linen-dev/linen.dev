import React from 'react';
import Image from 'next/image';
import styles from './index.module.css';

interface Props {
  src?: string;
  alt?: string;
  text: string;
}

export default function Avatar({ src, alt, text }: Props) {
  if (!src) {
    return <div className={styles.placeholder}>{text}</div>;
  }
  return (
    <div className={styles.avatar}>
      <Image
        className={styles.image}
        src={src}
        alt={alt}
        height="32"
        width="32"
      />
    </div>
  );
}
