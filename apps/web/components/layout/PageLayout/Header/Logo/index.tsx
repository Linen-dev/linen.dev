import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  src: string;
  alt: string;
}

export default function Logo({ src, alt }: Props) {
  if (src.endsWith('/linen-white-logo.svg')) {
    return (
      <img
        className={classNames(styles.logo, styles.linen)}
        src={src}
        height="24"
        width="108"
        alt={alt}
      />
    );
  }

  return <img className={styles.logo} src={src} height="24" alt={alt} />;
}
