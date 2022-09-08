import PageLayout from 'components/layout/PageLayout';
import { GetServerSidePropsContext } from 'next';
import { findAccountByPath } from 'lib/models';
import { buildSettings, Settings } from 'services/accountSettings';
import { AccountWithSlackAuthAndChannels } from 'types/partialTypes';
import { channels } from '@prisma/client';
import PermissionsService from 'services/permissions';
import { Permissions } from 'types/shared';
import { RedirectTo } from 'utilities/response';

interface Props {
  communityName: string;
  isSubDomainRouting: boolean;
  settings: Settings;
  channels: channels[];
  permissions: Permissions;
}

export default function Inbox({
  communityName,
  isSubDomainRouting,
  settings,
  channels,
  permissions,
}: Props) {
  return (
    <PageLayout
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      settings={settings}
      channels={channels}
      permissions={permissions}
    >
      Inbox
    </PageLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const access = await PermissionsService.inbox(context);
  if (!access) {
    return RedirectTo('/signin');
  }
  const communityName = context?.params?.communityName as string;
  const account = (await findAccountByPath(communityName, {
    include: { channels: { where: { hidden: false } } },
  })) as AccountWithSlackAuthAndChannels;
  if (!account) {
    return Promise.reject(new Error('Account not found'));
  }
  const settings = buildSettings(account);
  return {
    props: {
      communityName,
      isSubDomainRouting: false,
      settings,
      channels: account.channels,
      permissions: {
        inbox: access,
      },
    },
  };
}
