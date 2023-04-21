/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import SearchBar from 'components/search/SearchBar';
import JoinButton from 'components/JoinButton';
import { addHttpsToUrl } from '@linen/utilities/url';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';
import { Permissions, SerializedAccount } from '@linen/types';
import { SerializedChannel, Settings } from '@linen/types';
import UserAvatar from './UserAvatar';
import { Mode } from '@linen/hooks/mode';
import styles from './index.module.scss';
import { AxiosRequestConfig } from 'axios';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import UpgradeButton from './UpgradeButton';

interface Props {
  settings: Settings;
  channels: SerializedChannel[];
  channelName?: string;
  currentCommunity: SerializedAccount;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  mode: Mode;
  onProfileChange({ displayName }: { displayName: string }): Promise<void>;
  onUpload(data: FormData, options: AxiosRequestConfig): void;
}

function isWhiteColor(color: string) {
  return ['white', '#fff', '#ffffff'].includes(color.toLowerCase());
}

export default function Header({
  settings,
  channels,
  channelName,
  currentCommunity,
  isSubDomainRouting,
  permissions,
  onProfileChange,
  onUpload,
  mode,
}: Props) {
  const brandColor = currentCommunity.brandColor || '#111827';
  const fontColor = pickTextColorBasedOnBgColor(brandColor, 'white', 'black');
  const homeUrl = addHttpsToUrl(settings.homeUrl);
  const logoUrl = addHttpsToUrl(settings.logoUrl);
  const borderColor = isWhiteColor(brandColor) ? '#e5e7eb' : brandColor;
  return (
    <div
      className={classNames(styles.container, 'px-4 py-2')}
      style={{
        backgroundColor: brandColor,
        borderBottom: `1px solid ${borderColor}`,
        borderTop: `1px solid ${brandColor}`,
        gap: '16px',
        height: '54px',
      }}
    >
      <Link
        className="cursor-pointer block"
        href={homeUrl || '/'}
        passHref
        target="_blank"
      >
        <Logo src={logoUrl} alt={`${homeUrl} logo`} />
      </Link>
      <div
        className="flex w-full items-center"
        style={{
          justifyContent: 'flex-end',
          gap: '16px',
        }}
      >
        <div className="hidden lg:flex grow">
          <SearchBar
            brandColor={brandColor}
            borderColor={borderColor}
            channels={channels}
            communityName={settings.communityName}
            isSubDomainRouting={isSubDomainRouting}
            communityType={settings.communityType}
          />
        </div>
        {permissions.user && permissions.is_member ? (
          <>
            <div className="hidden lg:flex gap-2">
              {!currentCommunity.premium && permissions.manage && (
                <UpgradeButton />
              )}
              <UserAvatar
                currentUser={permissions.user}
                onProfileChange={onProfileChange}
                onUpload={onUpload}
              />
            </div>
            <div className="lg:hidden">
              <MobileMenu
                channelName={channelName}
                fontColor={fontColor}
                channels={channels}
                permissions={permissions}
              />
            </div>
          </>
        ) : (
          <>
            <JoinButton
              fontColor={fontColor}
              currentCommunity={currentCommunity}
              settings={settings}
            />
            <div className="lg:hidden">
              <MobileMenu
                channelName={channelName}
                fontColor={fontColor}
                channels={channels}
                permissions={permissions}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
