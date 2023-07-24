import React from 'react';
import { SerializedThread, Settings } from '@linen/types';
import { CustomLinkHelper } from '@linen/utilities/custom-link';
import styles from './index.module.scss';
import { FiChevronRight } from '@react-icons/all-files/fi/FiChevronRight';

export default function Breadcrumb({
  thread,
  settings,
  isSubDomainRouting,
}: {
  thread: SerializedThread;
  settings: Settings;
  isSubDomainRouting: boolean;
}) {
  const channelLink = thread.channel
    ? {
        isSubDomainRouting,
        communityName: settings.communityName,
        communityType: settings.communityType,
        path: `/c/${thread.channel.channelName}${
          thread.page ? `/${thread.page}` : ''
        }#${thread.id}`,
      }
    : null;
  return (
    <>
      {channelLink && (
        <a href={CustomLinkHelper(channelLink)} className={styles.link}>
          #{thread.channel?.channelName}
        </a>
      )}
      {channelLink && <FiChevronRight />}
    </>
  );
}
