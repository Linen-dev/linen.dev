import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import prisma from '../../../client';
import { channelIndex } from '../../../lib/models';
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

async function findAccountByEmail(session?: any) {
  if (!session) {
    return null;
  }
  const email = session.user?.email;
  if (!email) {
    return null;
  }
  const auth = await prisma.auths.findFirst({ where: { email } });
  if (!auth) {
    return null;
  }
  return await prisma.accounts.findFirst({
    where: { id: auth.accountId as string },
  });
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
