import React, { useEffect, useState } from 'react';
import preload from './utilities/preload';
import Spinner from '../Spinner';
import styles from './index.module.scss';

interface Props {
  className?: string;
  src: string;
  height?: number;
  width?: number;
  alt?: string;
  onLoad?(): void;
}

export default function Component({
  className,
  src,
  height: initialHeight,
  width: initialWidth,
  alt,
  onLoad,
}: Props) {
  const [width, setWidth] = useState(initialWidth || 0);
  const [height, setHeight] = useState(initialHeight || 0);
  const [loaded, setLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoaded(false);
    preload(src)
      .then((image: HTMLImageElement) => {
        if (mounted) {
          const width = image.naturalWidth;
          const height = image.naturalHeight;
          setWidth(width);
          setHeight(height);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setWidth(0);
          setHeight(0);
          setLoaded(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [src]);

  useEffect(() => {
    loaded && onLoad?.();
  }, [loaded]);

  if (loaded) {
    return (
      <div>
        <img
          className={className}
          src={src}
          alt={alt || src}
          width={width}
          height={height}
          onClick={() => setIsModalOpen(true)}
        />
        {isModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
            }}
            onClick={() => setIsModalOpen(false)}
          >
            <img
              src={src}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxWidth: '90%',
                maxHeight: '90%',
              }}
            />
          </div>
        )}
      </div>
    );
  }

  if (height) {
    return (
      <div className={styles.placeholder} style={{ height, width }}>
        <Spinner />
      </div>
    );
  }

  return null;
}
