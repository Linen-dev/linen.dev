import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';

interface Props {
  url: string;
  title: string;
}

function getTitle(url: string, title: string) {
  if (title) {
    if (title.startsWith('mailto:')) {
      return title.split(':')[1];
    }
    return title;
  }

  return url.split(':')[1];
}

function Mail({ url, title }: Props) {
  return (
    <a
      className={classNames(styles.link)}
      href={url}
      target="_blank"
      rel="noreferrer"
    >
      {getTitle(url, title)}
    </a>
  );
}

export default Mail;
