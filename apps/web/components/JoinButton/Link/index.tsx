import React from 'react';
import useHover from '@linen/hooks/hover';
import styles from './index.module.scss';

interface Props {
  fontColor: string;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
  href?: string;
  children: React.ReactNode;
}

function isWhiteColor(color: string) {
  return ['white', '#fff', '#ffffff'].includes(color.toLowerCase());
}

export default function Link({ fontColor, href, children, onClick }: Props) {
  const [ref, hover] = useHover<HTMLAnchorElement>();

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
