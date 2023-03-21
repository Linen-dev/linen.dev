import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  src: string;
  alt: string;
}

/*
  We currently upload logos of users to s3, but we don't save the height and width
  of the images in the db.
  This causes a layout shift once the logo is loaded inside of the browser, and that
  decreases the user experience.
  There are a couple ways we could fix it:

  1. Use the square logo version so we can hardcode the width and height.
  2. Save width/height in the db and retrieve it on page load.
  3. Reserve width in the header and load the image dynamically, pick best ratio.
*/

function isLinenLogo(src: string): boolean {
  return (
    src === 'https://static.main.linendev.com/linen-white-logo.svg' ||
    src ===
      'https://static.main.linendev.com/logos/linen-white-logod4a4fd54-2892-4499-ad31-af77bee6b08f.svg'
  );
}

export default function Logo({ src, alt }: Props) {
  if (isLinenLogo(src)) {
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
