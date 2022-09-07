import PageLayout from 'components/layout/PageLayout';
import { GetServerSidePropsContext } from 'next';
import { findAccountByPath } from 'lib/models';
import { buildSettings, Settings } from 'services/accountSettings';
import { AccountWithSlackAuthAndChannels } from 'types/partialTypes';
import { channels } from '@prisma/client';

interface Props {
  communityName: string;
  isSubDomainRouting: boolean;
  settings: Settings;
  channels: channels[];
}

export default function Inbox({
  communityName,
  isSubDomainRouting,
  settings,
  channels,
}: Props) {
  return (
    <PageLayout
      communityName={communityName}
      isSubDomainRouting={isSubDomainRouting}
      settings={settings}
      channels={channels}
    >
      Inbox
    </PageLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
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
    },
  };
}
