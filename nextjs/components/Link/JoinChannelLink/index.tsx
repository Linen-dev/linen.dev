import React from 'react';
import { AiOutlineLink } from 'react-icons/ai';
import styles from './index.module.css';

interface Props {
  href: string;
  communityType: string;
}

export default function JoinChannelLink({ href, communityType }: Props) {
  return (
    <a className={styles.join} href={href} target="_blank">
      <AiOutlineLink className={styles.icon} size={18} />
      {`Join thread in ${communityType === 'discord' ? 'Discord' : 'Slack'}`}
    </a>
  );
}
