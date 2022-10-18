import React from 'react';
import { GetServerSidePropsContext } from 'next';
import PageLayout from 'components/layout/PageLayout';
import StickyHeader from 'components/StickyHeader';
import { FiBarChart } from 'react-icons/fi';
import { SerializedAccount } from 'serializers/account';
import { SerializedChannel } from 'serializers/channel';
import serializeSettings, { Settings } from 'serializers/account/settings';
import ChannelsService from 'services/channels';
import CommunityService from 'services/community';
import PermissionsService from 'services/permissions';
import { NotFound } from 'utilities/response';
import { Permissions } from 'types/shared';
import styles from './index.module.scss';

interface Props {
  channels: SerializedChannel[];
  currentCommunity: SerializedAccount;
  permissions: Permissions;
  settings: Settings;
}

function Header() {
  return (
    <StickyHeader>
      <div className={styles.title}>
        <FiBarChart /> Metrics
      </div>
      <div className={styles.subtitle}>
        All of your community metrics in one place
      </div>
    </StickyHeader>
  );
}

export default function Metrics({ channels, settings, permissions }: Props) {
  return (
    <PageLayout
      channels={channels}
      permissions={permissions}
      settings={settings}
      isSubDomainRouting={false}
      token={null}
      className="w-full"
    >
      <Header />
    </PageLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const community = await CommunityService.find(context.params);

  if (!community) {
    return NotFound();
  }

  const channels = await ChannelsService.find(community.id);
  const settings = serializeSettings(community);
  const permissions = await PermissionsService.for(context);

  return {
    props: {
      channels,
      permissions,
      settings,
    },
  };
}
