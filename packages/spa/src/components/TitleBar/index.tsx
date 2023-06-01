import React from 'react';
import styles from './index.module.scss';
import { SerializedAccount } from '@linen/types';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';
import { FiMinus } from '@react-icons/all-files/fi/FiMinus';
import { FiMaximize } from '@react-icons/all-files/fi/FiMaximize';
import { FiX } from '@react-icons/all-files/fi/FiX';

interface Props {
  currentCommunity?: SerializedAccount;
}

export default function TitleBar({ currentCommunity }: Props) {
  const brandColor = currentCommunity?.brandColor || 'var(--color-navbar)';
  const fontColor = pickTextColorBasedOnBgColor(brandColor, 'white', 'black');
  return (
    <div
      data-tauri-drag-region
      className={styles.titlebar}
      style={{
        // backgroundColor: brandColor,
        color: fontColor,
      }}
    >
      <div className={styles['titlebar-button']} id="titlebar-close">
        <FiX id="titlebar-close-img" />
      </div>
      <div className={styles['titlebar-button']} id="titlebar-minimize">
        <FiMinus id="titlebar-minimize-img" />
      </div>
      <div className={styles['titlebar-button']} id="titlebar-maximize">
        <FiMaximize id="titlebar-maximize-img" />
      </div>
    </div>
  );
}
