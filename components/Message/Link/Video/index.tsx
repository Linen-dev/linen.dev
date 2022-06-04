import React from 'react';
import styles from './index.module.css';

interface Props {
  src: string;
}

export default function Video({ src }: Props) {
  return (
    <iframe
      className={styles.iframe}
      id="ytplayer"
      src={src}
      frameBorder="0"
    ></iframe>
  );
}
