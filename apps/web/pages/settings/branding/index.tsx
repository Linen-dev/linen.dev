import Branding from 'components/Pages/DeprecatedSettings/Branding';
import { findAccountAndUserByEmail } from 'lib/models';
import serializeAccount from 'serializers/account';
import { NextPageContext } from 'next';
import Session from 'services/session';
import Vercel, { DNSRecord } from 'services/vercel';
import { SerializedAccount, Roles } from '@linen/types';

interface Props {
  account: SerializedAccount;
  records?: DNSRecord[];
}

export default function BrandingPage({ account, records }: Props) {
  return <Branding account={account} records={records} />;
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

  let response;

  if (account && account.premium && account.redirectDomain) {
    response = await Vercel.findOrCreateDomainWithDnsRecords(
      account.redirectDomain
    );
  }

  return {
    props: {
      session,
      account: serializeAccount(account),
      ...response,
    },
  };
}
