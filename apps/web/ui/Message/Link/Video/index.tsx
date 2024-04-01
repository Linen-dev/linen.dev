import React, { useState } from 'react';
import styles from './index.module.scss';
import { FiPlay } from '@react-icons/all-files/fi/FiPlay';
import { getVideoId } from './utilities';

interface Props {
  src: string;
  onLoad?(): void;
}

export default function Video({ src }: Props) {
  const id = getVideoId(src);
  return (
    <a
      className={styles.placeholder}
      href={src}
      target="_blank"
      style={{
        backgroundImage: id
          ? `url(https://img.youtube.com/vi/${id}/0.jpg)`
          : '',
      }}
    >
      <span className={styles.play}>
        <FiPlay />
      </span>
    </a>
  );
}
