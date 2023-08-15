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
import { TypesenseSearch } from '@/Typesense';

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
  typesense?: {
    searchClient: (apiKey: string) => any;
    routing: any;
    middlewares?: any[];
  };
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
  typesense,
}: Props) {
  const brandColor = currentCommunity.brandColor || 'var(--color-navbar)';
  const fontColor = pickTextColorBasedOnBgColor(brandColor, 'white', 'black');
  const homeUrl = addHttpsToUrl(settings.homeUrl);
  const logoUrl = addHttpsToUrl(settings.logoUrl);
  const borderColor = isWhiteColor(brandColor) ? '#e5e7eb' : brandColor;

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: brandColor,
        borderBottom: `1px solid ${brandColor}`,
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
      {currentCommunity.search?.scope === 'public' &&
      !!currentCommunity.search?.apiKey &&
      currentCommunity.search?.engine === 'typesense' &&
      typesense?.searchClient ? (
        <TypesenseSearch
          apiKey={currentCommunity.search?.apiKey}
          indexName={currentCommunity.search?.indexName}
          key={`${currentCommunity.search?.indexName}${currentCommunity.search?.apiKey}`}
          searchClient={typesense.searchClient}
          settings={settings}
          routing={typesense.routing}
          middlewares={typesense.middlewares}
        />
      ) : (
        <SearchBar
          className={styles.search}
          brandColor={brandColor}
          channels={channels}
          accountId={settings.communityId}
          api={api}
          handleSelect={handleSelect}
        />
      )}
      <div className={styles.menu}>
        {permissions.user && permissions.is_member ? (
          <>
            <div className={styles.upgrade}>
              {!currentCommunity.premium && permissions.manage && (
                <UpgradeButton InternalLink={InternalLink} />
              )}
              <UserAvatar
                currentUser={permissions.user}
                signOut={signOut}
                api={api}
                key={permissions?.user?.id}
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
