import React from 'react';
import { capitalize } from '@linen/utilities/string';
import classNames from 'classnames';
import DiscordIcon from '@/DiscordIcon';
import SlackIcon from '@/SlackIcon';
import styles from './index.module.scss';

interface CommunityButtonProps {
  communityType: string;
  onClick: (value: string) => void;
  iconSize?: string;
  label?: string;
  fontSize?: string;
}

export default function CommunityButton({
  onClick,
  communityType,
  iconSize = '25',
  label = 'Connect to',
  fontSize = 'text-base',
}: CommunityButtonProps) {
  const Icon = communityType === 'discord' ? DiscordIcon : SlackIcon;

  return (
    <button
      aria-label={`${label}  ${capitalize(communityType)}`}
      className={classNames(styles.btn, fontSize)}
      type="button"
      onClick={() => onClick(communityType)}
    >
      <div className={styles.btnContent}>
        <Icon size={iconSize} />
        <p className={styles.whitespaceNowrap}>
          {label} <b>{capitalize(communityType)}</b>
        </p>
      </div>
    </button>
  );
}
