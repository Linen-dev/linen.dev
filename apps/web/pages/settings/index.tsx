import React from 'react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import serializeAccount from 'serializers/account';
import { channelIndex, findAccountAndUserByEmail } from 'lib/models';
import Settings, { SettingsProps } from 'components/Pages/Settings';
import { sortBy } from 'utilities/sort';
import { Roles } from '@prisma/client';

export default function SettingsPage(props: SettingsProps) {
  return <Settings {...props} />;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const accountAndUser = await findAccountAndUserByEmail(session?.user?.email);
  const { account, user } = accountAndUser || {};

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: 'signin',
      },
    };
  }

  if (!account) {
    return {
      props: {
        session,
      },
    };
  }

  if (user && user.role === Roles.MEMBER) {
    return {
      props: {
        session,
        account: account && serializeAccount(account),
        forbidden: true,
      },
    };
  }

  const channelsResponse = await channelIndex(account.id);
  const channels = sortBy(channelsResponse, 'channelName');
  return {
    props: {
      session,
      channels,
      account: account && serializeAccount(account),
    },
  };
}
