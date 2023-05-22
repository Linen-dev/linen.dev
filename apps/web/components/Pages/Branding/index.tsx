/* eslint-disable @next/next/no-img-element */
import PageLayout from 'components/layout/PageLayout';
import React, { useState } from 'react';
import {
  SerializedAccount,
  SerializedChannel,
  Permissions,
  Settings,
} from '@linen/types';
import { useRouter } from 'next/router';
import { api } from 'utilities/requests';
import BrandingView from '@linen/ui/BrandingView';
import InternalLink from 'components/Link/InternalLink';

export interface Props {
  channels: SerializedChannel[];
  communities: SerializedAccount[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
  isSubDomainRouting: boolean;
  dms: SerializedChannel[];
}

export default function Branding({
  channels,
  communities: initialCommunities,
  currentCommunity: initialCommunity,
  permissions,
  settings,
  isSubDomainRouting,
  dms,
}: Props) {
  const router = useRouter();
  const [communities, setCommunities] =
    useState<SerializedAccount[]>(initialCommunities);
  return (
    <PageLayout
      channels={channels}
      communities={communities}
      currentCommunity={initialCommunity}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={isSubDomainRouting}
      className="w-full"
      dms={dms}
    >
      <BrandingView
        reload={router.reload}
        initialCommunity={initialCommunity}
        api={api}
        setCommunities={setCommunities}
        InternalLink={InternalLink}
      />
    </PageLayout>
  );
}
