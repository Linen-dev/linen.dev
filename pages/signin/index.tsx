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
      <form
        method="post"
        action="/api/auth/callback/credentials?callbackUrl=/settings"
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <EmailField label="Email" id="email" required />
        <PasswordField label="Password" id="password" required />
        <Button type="submit" block>
          Submit
        </Button>
      </form>
      <div className="text-sm">
        <p className="py-3">
          Don't have an account?{' '}
          <Link href="https://airtable.com/shrIpkE0owg8FnoiM">Get Started</Link>
          <br />
        </p>
        <p>
          <Link href="/forgot-password">Forgot your password?</Link>
        </p>
      </div>
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
