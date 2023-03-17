import React from 'react';
import Component from '../../../Image';
import styles from './index.module.scss';
import { useInView } from 'react-intersection-observer';

interface Props {
  src: string;
  alt?: string;
  onLoad?(): void;
}

export default function Image({ src, alt, onLoad }: Props) {
  const { ref, inView } = useInView();

  if (!inView) {
    return <div ref={ref} className={styles.placeholder}></div>;
  }
  return (
    <div ref={ref}>
      <Component
        className={styles.image}
        height={200}
        width={200}
        src={src}
        alt={alt}
        onLoad={onLoad}
      />
    </div>
  );
}
