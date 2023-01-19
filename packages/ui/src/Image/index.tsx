import React, { useEffect, useState } from 'react';
import preload from './utilities/preload';
import Spinner from '../Spinner';
import styles from './index.module.scss';
import Preview from '../Preview';

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
  const [preview, setPreview] = useState(false);

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
          onClick={() => setPreview(true)}
        />
        {preview && (
          <Preview onClick={() => setPreview(false)}>
            <img src={src} />
          </Preview>
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
