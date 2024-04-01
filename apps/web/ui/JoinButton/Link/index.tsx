import React from 'react';
import classNames from 'classnames';
import useHover from '@linen/hooks/hover';
import styles from './index.module.scss';

interface Props {
  lighter?: boolean;
  brandColor?: string;
  fontColor: string;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
  href?: string;
  children: React.ReactNode;
}

function isWhiteColor(color?: string) {
  if (!color) {
    return false;
  }
  return ['white', '#fff', '#ffffff'].includes(color.toLowerCase());
}

function isBlackColor(color?: string) {
  if (!color) {
    return false;
  }
  return ['black', '#000', '#000000'].includes(color.toLowerCase());
}

export default function Link({
  lighter,
  brandColor,
  fontColor,
  href,
  children,
  onClick,
}: Props) {
  const [ref, hover] = useHover<HTMLAnchorElement>();

  if (isBlackColor(brandColor)) {
    return (
      <a
        className={classNames(styles.link, styles.highlight, {
          [styles.lighter]: lighter,
        })}
        href={href}
        target="_blank"
        ref={ref}
        onClick={onClick}
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  const standardColor = isWhiteColor(fontColor) ? '#ffffff' : '#000000';
  const hoverColor = isWhiteColor(fontColor) ? '#000000' : '#ffffff';
  const currentColor = hover ? hoverColor : standardColor;
  const backgroundColor = hover ? standardColor : 'transparent';
  return (
    <a
      className={styles.link}
      href={href}
      style={{
        color: currentColor,
        border: `1px solid ${standardColor}80`,
        background: backgroundColor,
      }}
      target="_blank"
      ref={ref}
      onClick={onClick}
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
