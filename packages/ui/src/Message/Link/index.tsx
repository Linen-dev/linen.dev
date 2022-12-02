import React from 'react';
import classNames from 'classnames';
import styles from './index.module.scss';
import { isImage, isVideo, isUrlValid, isMail } from './utilities';
import Accordion from '../../Accordion';
import Image from './Image';
import Video from './Video';
import Mail from './Mail';

interface Props {
  value: string;
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');
  if (isImage(href)) {
    return (
      <Accordion header={name || href}>
        <a href={href} target="_blank" rel="noreferrer ugc">
          <Image src={href} />
        </a>
      </Accordion>
    );
  }

  if (isVideo(href)) {
    return (
      <Accordion header={name || href}>
        <Video src={href} />
      </Accordion>
    );
  }

  if (isMail(href)) {
    return <Mail value={value} />;
  }

  const isHrefInvalid = !isUrlValid(href);
  const isExternalLink = !href.startsWith('https://linen.dev/');

  return (
    <a
      className={classNames('text-indigo-700', styles.link, {
        [styles.line]: isHrefInvalid,
      })}
      href={href}
      title={isHrefInvalid ? 'Invalid link' : ''}
      rel="noreferrer ugc"
      target={isExternalLink ? '_blank' : undefined}
    >
      {name || href}
    </a>
  );
}
