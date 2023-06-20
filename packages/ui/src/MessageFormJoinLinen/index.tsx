import React from 'react';
import styles from './index.module.scss';
import JoinButton from '@/JoinButton';
import { SerializedAccount, Settings } from '@linen/types';
import type { ApiClient } from '@linen/api-client';
import Button from '@/Button';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';

interface Props {
  startSignUp?: (props: any) => Promise<void>;
  api: ApiClient;
  currentCommunity: SerializedAccount;
  settings: Settings;
  isAuthenticated: boolean;
}

function MessageFormJoinLinen({
  api,
  startSignUp,
  currentCommunity,
  settings,
  isAuthenticated,
}: Props) {
  const Btn = JoinButton({
    startSignUp,
    status: isAuthenticated ? 'authenticated' : 'unauthenticated',
    api,
    reload: () => window.location.reload(),
  });

  const brandColor = currentCommunity.brandColor || 'var(--color-navbar)';
  const fontColor = pickTextColorBasedOnBgColor(brandColor, 'white', 'black');

  return (
    <div className={styles.chat}>
      <div className={styles.container}>
        <div className={styles.form}>
          <div className={styles.wrap}>
            <div className={styles.wrapBtn}>
              <Btn
                currentCommunity={currentCommunity}
                fontColor={fontColor}
                settings={settings}
                brandColor={brandColor}
              />
            </div>
          </div>
          <textarea
            id={`join-textarea`}
            className={styles.textarea}
            name="message"
            placeholder="Add your comment..."
            rows={2}
            value={''}
            disabled
          />
          <div className={styles.buttons}>
            <Button type="submit" weight="normal" size="xs" disabled>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MessageFormJoinLinen;
