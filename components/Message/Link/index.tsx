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

function isUrlValid(url: string): boolean {
  return !url.startsWith('http://-') && !url.startsWith('https://-');
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');
  const isHrefInvalid = !isUrlValid(href);
  return (
    <a
      className={classNames('text-indigo-700', styles.link, {
        [styles.line]: isHrefInvalid,
      })}
      href={href}
      title={isHrefInvalid ? 'Invalid link' : ''}
    >
      {name || href}
      {isImage(href) && <img src={href} alt={href} />}
    </a>
  );
}
