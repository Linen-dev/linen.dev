import React, { useEffect, useState } from 'react';
import Portal from '@/Portal';
import Preview from '@/Preview';
import useKeyboard from '@linen/hooks/keyboard';
import styles from './index.module.scss';
import { FiSave } from '@react-icons/all-files/fi/FiSave';
import { FiChevronLeft } from '@react-icons/all-files/fi/FiChevronLeft';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';

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

  function moveLeft() {
    setIndex((index) => {
      if (index === 0) {
        return images.length - 1;
      }
      return index - 1;
    });
  }

  function moveRight() {
    setIndex((index) => {
      if (index === images.length - 1) {
        return 0;
      }
      return index + 1;
    });
  }

  useKeyboard(
    {
      onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
          case 'ArrowLeft':
            return moveLeft();
          case 'ArrowRight':
            return moveRight();
        }
      },
    },
    [images]
  );

  const image = images[index];

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
        <img className={styles.preview} src={image} />
        {images.length > 1 && (
          <nav
            className={styles.options}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <div
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                moveLeft();
              }}
            >
              {images.length > 1 && <FiChevronLeft />}
            </div>
            {index + 1} / {images.length}
            <div
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                moveRight();
              }}
            >
              {images.length > 1 && <FiChevronRight />}
            </div>
          </nav>
        )}
        <nav className={styles.download}>
          <a
            href={image}
            target="_blank"
            rel="noreferrer"
            download
            onClick={async (event) => {
              event.preventDefault();
              event.stopPropagation();
              try {
                const response = await fetch(image);
                const blob = await response.blob();
                const href = window.URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = href;
                anchor.download = image
                  .replaceAll('/', '_')
                  .replaceAll(':', '_');
                document.body.appendChild(anchor);
                anchor.click();
                document.body.removeChild(anchor);
                window.URL.revokeObjectURL(href);
              } catch (exception) {
                window.open(image, '_blank');
              }
            }}
          >
            Download <FiSave />
          </a>
        </nav>
      </Preview>
    </Portal>
  );
}
