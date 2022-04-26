import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';

interface Props {
  value: string;
}

const SUPPORTED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif'];

function isImage(href: string): boolean {
  const extension = href.split('.').pop();
  if (!extension) {
    return false;
  }
  return SUPPORTED_EXTENSIONS.includes(extension.toLowerCase());
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');
  return (
    <a className={classNames('text-indigo-700', styles.link)} href={href}>
      {name || href}
      {isImage(href) && <img src={href} alt={href} />}
    </a>
  );
}
