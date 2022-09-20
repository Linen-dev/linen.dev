import Branding from 'components/Pages/Settings/Branding';
import { findAccountAndUserByEmail } from 'lib/models';
import serializeAccount, { SerializedAccount } from 'serializers/account';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import Vercel, { DNSRecord } from 'services/vercel';
import featureFlags from 'utilities/featureFlags';
import { Roles } from '@prisma/client';

interface Props {
  account: SerializedAccount;
  records?: DNSRecord[];
}

export default function BrandingPage({ account, records }: Props) {
  return <Branding account={account} records={records} />;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const accountAndUser = await findAccountAndUserByEmail(session?.user?.email);
  const { account, user } = accountAndUser || {};

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination: '../signin',
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

  if (
    featureFlags.isVercelDomainEnabled &&
    account &&
    account.premium &&
    account.redirectDomain
  ) {
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
