import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import Button from 'components/Button';
import Link from 'components/Link';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import Error from './Error';
import PasswordField from 'components/PasswordField';
import { useState } from 'react';
import { qs } from 'utilities/url';

interface SignInProps {
  csrfToken: string;
  error?: string;
  email: string;
  callbackUrl: string;
  state?: string;
}

const Anchor = ({ children, onClick }: any) => (
  <a
    className="text-blue-600 hover:text-blue-800 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </a>
);

export default function SignIn({
  csrfToken,
  error,
  email,
  callbackUrl,
  state,
}: SignInProps) {
  const [sign, setSign] = useState<'creds' | 'magic'>('creds');
  const [loading, setLoading] = useState(false);

  return (
    <Layout header="Sign In">
      <Error error={error} />
      {sign === 'creds' && (
        <form
          method="post"
          action={
            '/api/auth/callback/credentials?' + qs({ callbackUrl, state })
          }
          onSubmit={() => setLoading(true)}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <EmailField
            label="Email address"
            id="email"
            required
            defaultValue={email}
          />
          <PasswordField label="Password" id="password" required />

          <p className="py-3 text-sm">
            <Link href="/forgot-password">Forgot your password?</Link>
          </p>
          <Button type="submit" block disabled={loading}>
            {loading ? 'Loading...' : 'Sign in'}
          </Button>
          <div className="flex text-sm justify-between py-3">
            <Link href={'/signup?' + qs({ callbackUrl, state })}>
              Don&apos;t have an account?
            </Link>
            <Anchor onClick={() => setSign('magic')}>Sign in by email</Anchor>
          </div>
        </form>
      )}

      {sign === 'magic' && (
        <form
          method="post"
          action={'/api/auth/signin/email?' + qs({ callbackUrl, state })}
          onSubmit={() => setLoading(true)}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <EmailField
            label="Email address"
            id="email"
            required
            defaultValue={email}
          />
          <Button type="submit" block disabled={loading}>
            {loading ? 'Loading...' : 'Email me a link'}
          </Button>
          <p className="py-3 text-sm">
            We will send you an email containing a link to sign you in.
          </p>
          <div className="flex text-sm justify-between py-3">
            <Link href={'/signup?' + qs({ callbackUrl, state })}>
              Don&apos;t have an account?
            </Link>
            <Anchor onClick={() => setSign('creds')}>
              Sign in with credentials
            </Anchor>
          </div>
        </form>
      )}
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
