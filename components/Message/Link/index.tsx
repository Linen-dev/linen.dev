import React, { useState } from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { isImage, isUrlValid } from './utilities';
import Image from './Image';

interface Props {
  value: string;
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');
  const [visible, setVisible] = useState(true);

  if (isImage(href)) {
    return (
      <div>
        <p className={styles.text}>
          {name || href}
          <span
            className={styles.arrow}
            onClick={() => setVisible((visible) => !visible)}
          >
            {visible ? '▾' : '▸'}
          </span>
        </p>
        {visible && (
          <a href={href} target="_blank">
            <Image src={href} />
          </a>
        )}
      </div>
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
