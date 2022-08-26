import React from 'react';
import classNames from 'classnames';
import styles from './index.module.css';
import { isImage, isVideo, isUrlValid, isTweet, isMail } from './utilities';
import Toggle from 'components/Toggle';
import Image from './Image';
import Video from './Video';
import Tweet from './Tweet';
import Mail from './Mail';

interface Props {
  value: string;
}

export default function Link({ value }: Props) {
  const [href, name] = value.split('|');

  if (isImage(href)) {
    return (
      <Toggle header={name || href}>
        <a href={href} target="_blank" rel="noreferrer ugc">
          <Image src={href} />
        </a>
      </Toggle>
    );
  }

  if (isVideo(href)) {
    return (
      <Toggle header={name || href}>
        <Video src={href} />
      </Toggle>
    );
  }

  // Disabling twitter since it is not playing well with mobile view
  // if (isTweet(href)) {
  //   return (
  //     <Toggle header={name || href}>
  //       <Tweet src={href} />
  //     </Toggle>
  //   );
  // }

  if (isMail(href)) {
    return <Mail value={value} />;
  }

  const isHrefInvalid = !isUrlValid(href);

  return (
    <a
      className={classNames('text-indigo-700', styles.link, {
        [styles.line]: isHrefInvalid,
      })}
      href={href}
      title={isHrefInvalid ? 'Invalid link' : ''}
      rel="noreferrer ugc"
      target="_blank"
    >
      {name || href}
    </a>
  );
}
