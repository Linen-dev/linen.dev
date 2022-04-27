import React, { useState, useEffect } from 'react';

interface Props {
  className?: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export default function Image({ className, src, alt, width, height }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const img = document.createElement('img');
    img.onload = () => setLoaded(true);
    img.onerror = (err: any) => setError(err);
    img.src = src;
  }, []);

  if (error) {
    return <></>;
  }

  if (!loaded) {
    return <></>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
    />
  );
}
