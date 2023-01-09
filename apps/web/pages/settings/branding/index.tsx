import Branding from 'components/Pages/DeprecatedSettings/Branding';
import { findAccountAndUserByEmail } from 'lib/models';
import serializeAccount from 'serializers/account';
import { NextPageContext } from 'next';
import Session from 'services/session';
import { SerializedAccount, Roles } from '@linen/types';

interface Props {
  account: SerializedAccount;
}

export default function BrandingPage({ account }: Props) {
  return <Branding account={account} />;
}

export async function getServerSideProps({ req, res }: NextPageContext) {
  const session = await Session.find(req as any, res as any);
  const accountAndUser = await findAccountAndUserByEmail(session?.user?.email);
  const { account, user } = accountAndUser || {};

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination:
          '../signin?' +
          new URLSearchParams({ callbackUrl: '/settings/branding' }),
      },
    };
  }
  if (!account) {
    return {
      props: {
        session,
        account: null,
        // account: serializeAccount(account),
        // ...response,
      },
    };
  }

  if (user && user.role === Roles.MEMBER) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings?forbidden=1',
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
