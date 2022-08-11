import Layout from '../../components/layout/CardLayout';
import EmailField from '../../components/EmailField';
import PasswordField from '../../components/PasswordField';
import Button from '../../components/Button';
import Link from '../../components/Link';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import Error from './Error';

interface Props {
  csrfToken: string;
  error?: string;
}

export default function SignIn({ csrfToken, error }: Props) {
  return (
    <Layout header="Sign In">
      <Error error={error} />
      <form method="post" action="/api/auth/signin/email?callbackUrl=/settings">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <EmailField label="Email address" id="email" required />
        <Button type="submit" block>
          Sign in with Email
        </Button>
      </form>
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      error: context.query.error || null,
    },
  };
}
