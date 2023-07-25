import React, { useEffect } from 'react';
import Portal from '@/Portal';
import Preview from '@/Preview';
import styles from './index.module.scss';

interface Props {
  src: string;
  onClick(): void;
}

export default function ImagePreview({ src, onClick }: Props) {
  useEffect(() => {
    if (document.body) {
      document.body.classList.add(styles.overflow);
    }
  }, []);

  return (
    <Portal id="preview-portal">
      <Preview
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
          if (document.body) {
            document.body.classList.remove(styles.overflow);
          }
        }}
      >
        <img className={styles.preview} src={src} />
      </Preview>
    </Portal>
  );
}
