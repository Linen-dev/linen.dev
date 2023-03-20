import React from 'react';
import styles from './index.module.scss';
import { normalizeVideoUrl } from './utilities';

interface Props {
  src: string;
  onLoad?(): void;
}

export default function Video({ src, onLoad }: Props) {
  if (src.endsWith('.mov')) {
    return (
      <div className={styles.video}>
        <video controls>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );
  }

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
