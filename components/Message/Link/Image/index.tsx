import React, { useEffect, useState } from 'react';
import { preload } from './utilities';

interface Props {
  src: string;
  alt?: string;
}

export default function Component({ src, alt }: Props) {
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

  if (loaded && width > 0 && height > 0) {
    return <img src={src} alt={alt || src} width={width} height={height} />;
  }

  return null;
}
