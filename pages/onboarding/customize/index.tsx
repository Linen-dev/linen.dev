import React from 'react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import serializeAccount, { SerializedAccount } from '@/serializers/account';
import CustomizePage from '@/components/Pages/Onboarding/CustomizePage';
import { findAccountByEmail } from 'lib/models';

interface Props {
  account: SerializedAccount;
}

export default function OnboardingCustomize(props: Props) {
  return <CustomizePage {...props} />;
}

function redirectToSignIn() {
  return {
    redirect: {
      permanent: false,
      destination: 'signin?callbackUrl=/onboarding/customize',
    },
  };
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (!session) {
    return redirectToSignIn();
  }

  const account = await findAccountByEmail(session);
  if (!account || !account.id) {
    return {
      redirect: {
        permanent: false,
        destination: 'onboarding',
      },
    };
  }
  return {
    props: {
      account: serializeAccount(account),
    },
  };
}
