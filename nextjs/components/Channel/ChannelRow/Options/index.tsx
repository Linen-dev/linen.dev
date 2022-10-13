import React from 'react';
import classNames from 'classnames';
import { getThreadUrl } from '../../../Pages/ChannelsPage/utilities/url';
import { copyToClipboard } from 'utilities/clipboard';
import { toast } from 'components/Toast';
import { Permissions } from 'types/shared';
import { GoPin } from 'react-icons/go';
import { AiOutlinePaperClip } from 'react-icons/ai';
import type { Settings } from 'serializers/account/settings';
import { SerializedThread } from 'serializers/thread';
import styles from './index.module.scss';

interface Props {
  className?: string;
  thread: SerializedThread;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  onPin(threadId: string): void;
}

export default function Options({
  className,
  thread,
  permissions,
  settings,
  isSubDomainRouting,
  onPin,
}: Props) {
  return (
    <ul className={classNames(styles.options, className)}>
      <li
        onClick={(event) => {
          const text = getThreadUrl({
            isSubDomainRouting,
            settings,
            incrementId: thread.incrementId,
            slug: thread.slug,
          });
          event.stopPropagation();
          event.preventDefault();
          copyToClipboard(text);
          toast.success('Copied to clipboard', text);
        }}
      >
        <AiOutlinePaperClip />
      </li>
      {permissions.manage && (
        <li
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            onPin(thread.id);
          }}
        >
          <GoPin className={thread.pinned ? styles.pinned : ''} />
        </li>
      )}
    </ul>
  );
}
