import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import serializeAccount, {
  SerializedAccount,
} from '../../../serializers/account';
import { findAccountByEmail } from '../../../lib/models';

interface Props {
  account?: SerializedAccount;
}

export default function SettingsPage({ account }: Props) {
  const { data: session } = useSession();

  if (session && account) {
    return <DashboardLayout header="Plans">{account.premium}</DashboardLayout>;
  }
  return (
    <DashboardLayout header="Plans">
      <h1>You are not signed in.</h1>
    </DashboardLayout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: 'signup/CreateAccountForm',
      },
    };
  }
  return {
    props: {
      session,
      account: serializeAccount(account),
    },
  };
}
