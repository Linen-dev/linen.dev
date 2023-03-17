import React from 'react';
import styles from './index.module.scss';
import { normalizeVideoUrl } from './utilities';
import { useInView } from 'react-intersection-observer';

interface Props {
  src: string;
  onLoad?(): void;
}

export default function Video({ src, onLoad }: Props) {
  const { ref, inView } = useInView();
  if (!inView) {
    return (
      <div ref={ref} className={styles.video}>
        <div className={styles.placeholder}></div>
      </div>
    );
  }
  if (src.endsWith('.mov')) {
    return (
      <div ref={ref} className={styles.video}>
        <video controls>
          <source src={src} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div ref={ref} className={styles.video}>
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
