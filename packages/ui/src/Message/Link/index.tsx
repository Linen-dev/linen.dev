import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { isImage, isVideo, isUrlValid, isMail } from './utilities';
import Accordion from '@/Accordion';
import Image from './Image';
import Video from './Video';
import Mail from './Mail';

interface Props {
  url: string;
  title: string;
  onClick?(event: React.MouseEvent<HTMLAnchorElement>): void;
  onLoad?(): void;
}

export default function Link({ url, title, onClick, onLoad }: Props) {
  if (isImage(url)) {
    return (
      <Accordion header={title}>
        <Image src={url} onLoad={onLoad} />
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
      className={classNames(styles.link, {
        [styles.line]: isHrefInvalid,
      })}
      href={url}
      title={isHrefInvalid ? 'Invalid link' : ''}
      rel="noreferrer ugc"
      target={isExternalLink ? '_blank' : undefined}
      onClick={onClick}
    >
      {title}
    </a>
  );
}
