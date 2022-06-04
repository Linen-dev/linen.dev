import React from 'react';
import styles from './index.module.css';
import { normalizeVideoUrl } from './utilities';

interface Props {
  src: string;
}

export default function Video({ src }: Props) {
  return (
    <iframe
      className={styles.iframe}
      id="ytplayer"
      src={normalizeVideoUrl(src)}
      frameBorder="0"
    ></iframe>
  );
}
