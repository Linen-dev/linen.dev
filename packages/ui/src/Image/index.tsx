import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import preload from './utilities/preload';
import Spinner from '@/Spinner';
import styles from './index.module.scss';
import ImagePreview from '@/ImagePreview';
import { AiOutlineFileImage } from '@react-icons/all-files/ai/AiOutlineFileImage';

interface Props {
  className?: string;
  src: string;
  height?: number;
  width?: number;
  alt?: string;
  onLoad?(): void;
  onClick?(src: string): void;
  isBot?: boolean;
}

export default function Component({
  className,
  src,
  height: initialHeight,
  width: initialWidth,
  alt,
  onLoad,
  onClick,
  isBot,
}: Props) {
  const [width, setWidth] = useState(initialWidth || 0);
  const [height, setHeight] = useState(initialHeight || 0);
  const [loaded, setLoaded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoaded(false);
    preload(src)
      .then((image: HTMLImageElement) => {
        if (mounted) {
          setWidth((width) => width || image.naturalWidth);
          setHeight((height) => height || image.naturalHeight);
          setLoaded(true);
        }
      })
      .catch((exception) => {
        if (mounted) {
          setError(exception);
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

  if (isBot) {
    return <img className={className} src={src} alt={alt || src} />;
  }

  if (loaded) {
    return (
      <div>
        <img
          className={classNames(styles.image, className)}
          src={src}
          alt={alt || src}
          width={width}
          height={height}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (onClick) {
              onClick(src);
            } else {
              setPreview(true);
            }
          }}
        />
        {preview && (
          <ImagePreview
            current={src}
            images={[src]}
            onClick={() => setPreview(false)}
          />
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

  if (error) {
    return (
      <div
        className={classNames(styles.placeholder, styles.error)}
        style={{ height: initialHeight, width: initialWidth }}
      >
        <AiOutlineFileImage className={styles.icon} />
        404
        <br />
        Not Found
      </div>
    );
  }

  return null;
}
