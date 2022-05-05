import React from 'react';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import CreateAccountForm from '@/components/Pages/Onboarding/CreateAccountForm';
import { accounts } from '@prisma/client';
import { findAccountByEmail } from 'lib/models';

interface Props {
  email: string;
  account?: accounts;
}

export default function OnboardingPage(props: Props) {
  return <CreateAccountForm {...props} />;
}

function redirectToSignIn() {
  return {
    redirect: {
      permanent: false,
      destination: 'signin?callbackUrl=/onboarding',
    },
  };
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  if (!session || !session.user || !session.user.email) {
    return redirectToSignIn();
  }
  const account = await findAccountByEmail(session);

  return {
    props: {
      account,
      email: session.user.email,
    },
  };
}
