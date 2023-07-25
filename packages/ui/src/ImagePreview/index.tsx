import React, { useEffect, useState } from 'react';
import Portal from '@/Portal';
import Preview from '@/Preview';
import useKeyboard from '@linen/hooks/keyboard';
import styles from './index.module.scss';

interface Props {
  current: string;
  images: string[];
  onClick(): void;
}

export default function ImagePreview({ current, images, onClick }: Props) {
  const [index, setIndex] = useState(images.indexOf(current));
  useEffect(() => {
    if (document.body) {
      document.body.classList.add(styles.overflow);
    }
  }, []);

  useKeyboard(
    {
      onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
          case 'ArrowRight':
            return setIndex((index) => {
              if (index === images.length - 1) {
                return 0;
              }
              return index + 1;
            });
          case 'ArrowLeft':
            return setIndex((index) => {
              if (index === 0) {
                return images.length - 1;
              }
              return index - 1;
            });
        }
      },
    },
    [images]
  );

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
        <img className={styles.preview} src={images[index]} />
      </Preview>
    </Portal>
  );
}
