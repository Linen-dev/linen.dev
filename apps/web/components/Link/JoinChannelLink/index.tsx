import React from 'react';
import { FiExternalLink } from '@react-icons/all-files/fi/FiExternalLink';
import styles from './index.module.scss';

interface Props {
  href: string;
  communityType: string;
}

export default function JoinChannelLink({ href, communityType }: Props) {
  return (
    <a className={styles.join} href={href} target="_blank" rel="noreferrer">
      <FiExternalLink className={styles.icon} size={18} />
      {`Join thread in ${communityType === 'discord' ? 'Discord' : 'Slack'}`}
    </a>
  );
}
