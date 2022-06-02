import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { isImage, isUrlValid } from './utilities';
import Image from './Image';

interface Props {
  value: string;
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
      {isImage(href) && <Image src={href} />}
    </a>
  );
}
