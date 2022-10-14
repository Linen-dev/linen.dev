import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import SignUpWithCredentials from 'components/Pages/SignUp/Credentials';
import Layout from 'components/layout/CardLayout';

interface SignUpProps {
  csrfToken: string;
  email: string;
  callbackUrl: string;
  error: string;
  state: string;
}

export default function SignUp({
  csrfToken,
  email,
  callbackUrl,
  state,
}: SignUpProps) {
  return (
    <Layout header="Sign Up for free">
      <SignUpWithCredentials {...{ state, callbackUrl, csrfToken, email }} />
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      error: context.query.error || null,
      callbackUrl: context.query.callbackUrl || '/api/settings',
      email: context.query.email || null,
      state: context.query.state || null,
    },
  };
}
