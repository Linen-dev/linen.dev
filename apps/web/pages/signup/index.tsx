import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import SignUpWithCredentials from 'components/Pages/SignUp/Credentials';
import SignUpWithMagicLink from 'components/Pages/SignUp/MagicLink';
import Layout from 'components/layout/CardLayout';

interface SignUpProps {
  csrfToken: string;
  email: string;
  callbackUrl: string;
  error: string;
  state: string;
  mode: string;
}

export default function SignUp({
  csrfToken,
  email,
  callbackUrl,
  state,
  mode,
}: SignUpProps) {
  if (state || mode === 'creds') {
    return (
      <Layout header="Sign Up">
        <SignUpWithCredentials {...{ state, callbackUrl, csrfToken, email }} />
      </Layout>
    );
  }
  return (
    <Layout header="Sign Up">
      <SignUpWithMagicLink
        callbackUrl={callbackUrl}
        csrfToken={csrfToken}
        email={email}
      />
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      error: context.query.error || null,
      callbackUrl: context.query.callbackUrl || '/api/settings',
      email: context.query.email || '',
      state: context.query.state || null,
      mode: context.query.mode || null,
    },
  };
}
