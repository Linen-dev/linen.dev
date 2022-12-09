import React, { useEffect, useState } from 'react';
import preload from './utilities/preload';

interface Props {
  className?: string;
  src: string;
  alt?: string;
  onLoad?(): void;
}

export default function Component({ className, src, alt, onLoad }: Props) {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState(false);

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
      <img
        className={className}
        src={src}
        alt={alt || src}
        width={width}
        height={height}
      />
    );
  }

  return null;
}
