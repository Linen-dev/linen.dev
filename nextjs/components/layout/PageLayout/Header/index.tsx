/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import SearchBar from 'components/search/SearchBar';
import JoinButton from 'components/JoinButton';
import { addHttpsToUrl } from 'utilities/url';
import { pickTextColorBasedOnBgColor } from 'utilities/colors';
import { Permissions } from 'types/shared';
import { Settings } from 'serializers/account/settings';
import type { ChannelSerialized } from 'lib/channel';
import UserAvatar from './UserAvatar';
import { SerializedUser } from 'serializers/user';

interface Props {
  settings: Settings;
  channels: ChannelSerialized[];
  currentUser?: SerializedUser | null;
  isSubDomainRouting: boolean;
  permissions: Permissions;
  onProfileChange({
    displayName,
    userId,
  }: {
    displayName: string;
    userId: string;
  }): Promise<void>;
}

function isWhiteColor(color: string) {
  return ['white', '#fff', '#ffffff'].includes(color.toLowerCase());
}

export default function Header({
  settings,
  channels,
  currentUser,
  isSubDomainRouting,
  permissions,
  onProfileChange,
}: Props) {
  const { brandColor, communityName } = settings;
  const homeUrl = addHttpsToUrl(settings.homeUrl);
  const docsUrl = addHttpsToUrl(settings.docsUrl);
  const logoUrl = addHttpsToUrl(settings.logoUrl);
  const fontColor = pickTextColorBasedOnBgColor(brandColor, 'white', 'black');
  const borderColor = isWhiteColor(brandColor) ? '#e5e7eb' : brandColor;
  return (
    <div
      className="flex h-16 px-4 py-2 items-center"
      style={{
        backgroundColor: brandColor,
        borderBottom: `1px solid ${borderColor}`,
        borderTop: `1px solid ${brandColor}`,
        gap: '24px',
      }}
    >
      <Link href={homeUrl || '/'} passHref>
        <a className="cursor-pointer block" target="_blank">
          <img
            className="block"
            style={{ height: '32px' }}
            src={logoUrl}
            height="32"
            alt={`${homeUrl} logo`}
          />
        </a>
      </Link>
      <div
        className="flex w-full items-center"
        style={{
          justifyContent: 'flex-end',
          gap: '24px',
        }}
      >
        <div className="hidden sm:flex grow">
          <SearchBar
            borderColor={borderColor}
            channels={channels}
            communityName={communityName}
            isSubDomainRouting={isSubDomainRouting}
            communityType={settings.communityType}
          />
        </div>
        <a
          className="hidden sm:flex items-center text-sm"
          style={{ color: fontColor, fontWeight: 500 }}
          rel="noreferrer"
          title="Documentation"
          target="_blank"
          href={docsUrl}
        >
          Docs
        </a>
        {currentUser ? (
          <UserAvatar
            currentUser={currentUser}
            onProfileChange={onProfileChange}
          />
        ) : (
          <JoinButton settings={settings} permissions={permissions} />
        )}
      </div>
    </div>
  );
}
