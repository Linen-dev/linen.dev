import React, { useEffect, useState } from 'react';
import Image from 'components/Image';
import styles from './index.module.css';

interface Props {
  src: string;
  alt?: string;
}

export default function Component({ src, alt }: Props) {
  return <Image className={styles.image} src={src} alt={alt} />;
}
