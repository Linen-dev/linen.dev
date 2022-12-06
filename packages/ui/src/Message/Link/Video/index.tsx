import React from 'react';
import styles from './index.module.scss';
import { normalizeVideoUrl } from './utilities';

interface Props {
  src: string;
  onLoad?(): void;
}

export default function Video({ src, onLoad }: Props) {
  return (
    <div className={styles.video}>
      <iframe
        className={styles.iframe}
        id="ytplayer"
        src={normalizeVideoUrl(src)}
        onLoad={onLoad}
        frameBorder="0"
      ></iframe>
    </div>
  );
}
