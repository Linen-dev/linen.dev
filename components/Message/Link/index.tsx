import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { isImage, isUrlValid } from './utilities';
import Toggle from 'components/Toggle';
import Image from './Image';

interface Props {
  value: string;
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');

  if (isImage(href)) {
    return (
      <Toggle header={name || href}>
        <a href={href} target="_blank">
          <Image src={href} />
        </a>
      </Toggle>
    );
  }

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
    </a>
  );
}
