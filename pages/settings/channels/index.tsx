import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { channelIndex, findAccountByEmail } from '../../../lib/models';
import { channels } from '@prisma/client';
import ChannelVisibilityToggle from '../../../components/Pages/Settings/Channels/ChannelVisibilityToggle';
import ChannelSetDefault from '../../../components/Pages/Settings/Channels/ChannelSetDefault';
import { sortBy } from '../../../utilities/sort';

interface Props {
  channels?: channels[];
  accountId: string;
}

export default function ChannelsPage({ channels, accountId }: Props) {
  const { data: session } = useSession();

  if (session && channels) {
    return (
      <DashboardLayout header="Channels">
        <ChannelSetDefault channels={channels} />
        <hr style={{ margin: 25 }} />
        <ChannelVisibilityToggle channels={channels} />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout header="Channels">
      <h1>You are not signed in.</h1>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session);

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: 'signup/CreateAccountForm',
      },
    };
  }

  const channels = await channelIndex(account.id).then((response) =>
    sortBy(response, 'channelName')
  );
  return {
    props: {
      session,
      channels,
      accountId: account.id,
    },
  };
}
