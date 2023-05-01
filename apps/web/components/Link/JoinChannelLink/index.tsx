import React from 'react';
import classNames from 'classnames';
import { FiExternalLink } from '@react-icons/all-files/fi/FiExternalLink';
import styles from './index.module.scss';

interface Props {
  className?: string;
  href: string;
  communityType: string;
}

export default function JoinChannelLink({
  className,
  href,
  communityType,
}: Props) {
  return (
    <a
      className={classNames(styles.join, className)}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <FiExternalLink className={styles.icon} size={18} />
      {`Join thread in ${communityType === 'discord' ? 'Discord' : 'Slack'}`}
    </a>
  );
}
