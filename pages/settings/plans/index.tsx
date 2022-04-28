import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import prisma from '../../../client';
import serializeAccount, {
  SerializedAccount,
} from '../../../serializers/account';

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
  return {
    props: {
      session,
      account: serializeAccount(account),
    },
  };
}
