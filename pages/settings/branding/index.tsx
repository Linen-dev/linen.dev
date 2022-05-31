import Branding from 'components/Pages/Settings/Branding';
import { findAccountByEmail } from 'lib/models';
import serializeAccount, { SerializedAccount } from 'serializers/account';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';

interface Props {
  account: SerializedAccount;
}

export default function BrandingPage({ account }: Props) {
  return <Branding account={account} />;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session?.user?.email);

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
      redirect: {
        permanent: false,
        destination: '../settings',
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
