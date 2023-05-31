import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { addHttpsToUrl } from '@linen/utilities/url';
import { pickTextColorBasedOnBgColor } from '@linen/utilities/colors';
import type {
  Permissions,
  SerializedAccount,
  SerializedChannel,
  SerializedSearchMessage,
  Settings,
} from '@linen/types';
import UserAvatar from './UserAvatar';
import styles from './index.module.scss';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import UpgradeButton from './UpgradeButton';
import type { ApiClient } from '@linen/api-client';
import SearchBar from '@/SearchBar';
import EventEmitter from '@linen/utilities/event';
import { FiInfo } from '@react-icons/all-files/fi/FiInfo';
import { FiX } from '@react-icons/all-files/fi/FiX';

interface Props {
  settings: Settings;
  channels: SerializedChannel[];
  channelName?: string;
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  // dep injection
  JoinButton(props: {
    brandColor?: string;
    fontColor: string;
    currentCommunity: SerializedAccount;
    settings: Settings;
  }): JSX.Element;
  Link: any;
  InternalLink: (args: any) => JSX.Element;
  routerAsPath: string;
  signOut: () => void;
  usePath: (args: { href: string }) => string;
  api: ApiClient;
  handleSelect: (message: SerializedSearchMessage) => void;
  logoClassName?: string;
}

function isWhiteColor(color: string) {
  return ['white', '#fff', '#ffffff'].includes(color.toLowerCase());
}

export default function Header({
  settings,
  channels,
  channelName,
  currentCommunity,
  permissions,
  JoinButton,
  Link,
  InternalLink,
  routerAsPath,
  signOut,
  usePath,
  api,
  handleSelect,
  logoClassName,
}: Props) {
  const [lastMentionChannel, setLastMentionChannel] =
    useState<SerializedChannel>();
  const brandColor = currentCommunity.brandColor || 'var(--color-navbar)';
  const fontColor = pickTextColorBasedOnBgColor(brandColor, 'white', 'black');
  const homeUrl = addHttpsToUrl(settings.homeUrl);
  const logoUrl = addHttpsToUrl(settings.logoUrl);
  const borderColor = isWhiteColor(brandColor) ? '#e5e7eb' : brandColor;

  useEffect(() => {
    const handler = (channel: SerializedChannel) => {
      setLastMentionChannel(channel);
    };

    EventEmitter.on('mention:new', handler);
    return () => {
      EventEmitter.off('mention:new', handler);
    };
  }, []);

  useEffect(() => {
    const handler = (channel: SerializedChannel) => {
      if (lastMentionChannel && lastMentionChannel.id === channel.id) {
        setLastMentionChannel(undefined);
      }
    };

    EventEmitter.on('navbar:channel:clicked', handler);
    return () => {
      EventEmitter.off('navbar:channel:clicked', handler);
    };
  }, [lastMentionChannel]);

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: brandColor,
        borderBottom: `1px solid ${borderColor}`,
        borderTop: `1px solid ${brandColor}`,
      }}
    >
      <Link
        className={classNames(styles.logo, logoClassName)}
        href={homeUrl || '/'}
        passHref
        target="_blank"
      >
        <Logo src={logoUrl} alt={`${homeUrl} logo`} />
      </Link>
      <SearchBar
        className={styles.search}
        brandColor={brandColor}
        channels={channels}
        accountId={settings.communityId}
        api={api}
        handleSelect={handleSelect}
      />
      <div className={styles.menu}>
        {permissions.user && permissions.is_member ? (
          <>
            {lastMentionChannel && (
              <div
                className={styles.mention}
                style={{ color: fontColor }}
                onClick={() => setLastMentionChannel(undefined)}
              >
                <InternalLink href={`/c/${lastMentionChannel.channelName}`}>
                  You were mentioned in #{lastMentionChannel.channelName}
                </InternalLink>
                <FiX />
              </div>
            )}
            <div className={styles.upgrade}>
              {!currentCommunity.premium && permissions.manage && (
                <UpgradeButton InternalLink={InternalLink} />
              )}
              <UserAvatar
                currentUser={permissions.user}
                signOut={signOut}
                api={api}
              />
            </div>
            <div className={styles.lgHidden}>
              <MobileMenu
                channelName={channelName}
                fontColor={fontColor}
                channels={channels}
                permissions={permissions}
                InternalLink={InternalLink}
                routerAsPath={routerAsPath}
                signOut={signOut}
                usePath={usePath}
              />
            </div>
          </>
        ) : (
          <>
            <JoinButton
              brandColor={brandColor}
              fontColor={fontColor}
              currentCommunity={currentCommunity}
              settings={settings}
            />
            <div className={styles.lgHidden}>
              <MobileMenu
                channelName={channelName}
                fontColor={fontColor}
                channels={channels}
                permissions={permissions}
                InternalLink={InternalLink}
                routerAsPath={routerAsPath}
                signOut={signOut}
                usePath={usePath}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
