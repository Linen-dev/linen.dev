import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { isImage, isVideo, isUrlValid, isMail } from './utilities';
import Accordion from '../../Accordion';
import Image from './Image';
import Video from './Video';
import Mail from './Mail';

interface Props {
  url: string;
  title: string;
  onLoad?(): void;
}

export default function Link({ url, title, onLoad }: Props) {
  if (isImage(url)) {
    return (
      <Accordion header={title}>
        <a href={url} target="_blank" rel="noreferrer ugc">
          <Image src={url} onLoad={onLoad} />
        </a>
      </Accordion>
    );
  }

  if (isVideo(url)) {
    return (
      <Accordion header={title}>
        <Video src={url} onLoad={onLoad} />
      </Accordion>
    );
  }

  if (isMail(url)) {
    return <Mail url={url} title={title} />;
  }

  const isHrefInvalid = !isUrlValid(url);
  const isExternalLink = !url.startsWith('https://linen.dev/');

  return (
    <a
      className={classNames('text-indigo-700', styles.link, {
        [styles.line]: isHrefInvalid,
      })}
      href={url}
      title={isHrefInvalid ? 'Invalid link' : ''}
      rel="noreferrer ugc"
      target={isExternalLink ? '_blank' : undefined}
    >
      {title}
    </a>
  );
}
