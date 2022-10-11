import Layout from '../../components/layout/CardLayout';
import EmailField from '../../components/EmailField';
import Button from '../../components/Button';
import Link from '../../components/Link';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import Error from './Error';
import PasswordField from 'components/PasswordField';
import { useState } from 'react';
import { SiGoogle } from 'react-icons/si';

interface SignInProps {
  csrfToken: string;
  error?: string;
}

const Anchor = ({ children, onClick }: any) => (
  <a
    className="text-blue-600 hover:text-blue-800 cursor-pointer"
    onClick={onClick}
  >
    {children}
  </a>
);

export default function SignIn({ csrfToken, error }: SignInProps) {
  const [sign, setSign] = useState<'creds' | 'magic'>('creds');
  const [loading, setLoading] = useState(false);

  return (
    <Layout header="Sign In">
      <Error error={error} />
      {sign === 'creds' && (
        <form
          method="post"
          action="/api/auth/callback/credentials?callbackUrl=/api/settings"
          onSubmit={() => setLoading(true)}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <EmailField label="Email address" id="email" required />
          <PasswordField label="Password" id="password" required />

          <p className="py-3 text-sm">
            <Link href="/forgot-password">Forgot your password?</Link>
          </p>
          <Button type="submit" className="shadow-sm" block disabled={loading}>
            {loading ? 'Loading...' : 'Sign in'}
          </Button>
          <div className="flex text-sm justify-between py-3">
            <Link href="/signup">Don&apos;t have an account?</Link>
            <Anchor onClick={() => setSign('magic')}>Sign in by email</Anchor>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: '1px solid #e5e7eb' }}
              />
            </div>
            <div className="relative flex justify-center text-sm mb-3">
              <span className="bg-white px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>
          <div>
            <a
              href="/api/auth/signin/google?callbackUrl=/api/settings"
              className="inline-flex w-full justify-center rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
              style={{ border: '1px solid #e5e7eb' }}
            >
              <span className="sr-only">Sign in with Google</span>
              <SiGoogle />
            </a>
          </div>
        </form>
      )}

      {sign === 'magic' && (
        <form
          method="post"
          action="/api/auth/signin/email?callbackUrl=/api/settings"
          onSubmit={() => setLoading(true)}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <EmailField label="Email address" id="email" required />
          <Button type="submit" block disabled={loading}>
            {loading ? 'Loading...' : 'Email me a link'}
          </Button>
          <p className="py-3 text-sm">
            We will send you an email containing a link to sign you in.
          </p>
          <div className="flex text-sm justify-between py-3">
            <Link href="/signup">Don&apos;t have an account?</Link>
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
    },
  };
}
