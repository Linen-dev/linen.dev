import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import { Button } from '@linen/ui';
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
  mode?: string;
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
  email: initialEmail,
  callbackUrl,
  state,
  mode: initialMode,
}: SignInProps) {
  const [email, setEmail] = useState(initialEmail);
  const [mode, setMode] = useState<'creds' | 'magic'>(
    initialMode === 'creds' ? 'creds' : 'magic'
  );
  const [loading, setLoading] = useState(false);

  return (
    <Layout header="Sign In">
      <Error error={error} />

      {mode === 'magic' && (
        <form
          className="px-2"
          method="post"
          action={'/api/auth/signin/email?' + qs({ callbackUrl })}
          onSubmit={() => setLoading(true)}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <EmailField
            placeholder="Email address"
            id="email"
            required
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          />
          <Button type="submit" block disabled={loading}>
            Continue
          </Button>
          <p className="text-xs  text-gray-600">
            By using the platform, you agree to our{' '}
            <a
              target="_blank"
              className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
              href="/legal/terms"
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
              target="_blank"
              href="/legal/privacy"
            >
              Privacy Policy.
            </a>
          </p>
          <hr className="my-10" />

          <div className="flex justify-between">
            <p className="text-xs  text-gray-700">
              No account?
              <br />
              <Link href="/signup">Sign up for free</Link>.
            </p>
            <p className="text-xs  text-gray-700 pb-3">
              Prefer passwords?
              <br />
              <a
                className="text-blue-600 hover:text-blue-800 visited:text-purple-600 cursor-pointer"
                onClick={() => setMode('creds')}
              >
                Sign in with credentials
              </a>
              .
            </p>
          </div>
        </form>
      )}

      {mode === 'creds' && (
        <form
          className="px-2"
          method="post"
          action={
            '/api/auth/callback/credentials?' + qs({ callbackUrl, state })
          }
          onSubmit={() => setLoading(true)}
        >
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <EmailField
            placeholder="Email address"
            id="email"
            required
            value={email}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(event.target.value)
            }
          />
          <PasswordField placeholder="Password" id="password" required />

          <Button type="submit" block disabled={loading}>
            Continue
          </Button>
          <p className="text-xs  text-gray-600">
            By using the platform, you agree to our{' '}
            <a
              target="_blank"
              className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
              href="/legal/terms"
            >
              Terms
            </a>{' '}
            and{' '}
            <a
              className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
              target="_blank"
              href="/legal/privacy"
            >
              Privacy Policy.
            </a>
          </p>

          <p className="text-xs pt-5 text-gray-700 pb-3">
            <Link href={`/forgot-password?email=${email || ''}`}>
              Forgot your password?
            </Link>
          </p>

          <hr className="my-5" />

          <div className="flex justify-between">
            <p className="text-xs  text-gray-700">
              No account?
              <br />
              <Link href="/signup">Sign up for free</Link>.
            </p>
            <p className="text-xs text-gray-700 pb-3">
              Prefer email?
              <br />
              <a
                className="text-blue-600 hover:text-blue-800 visited:text-purple-600 cursor-pointer"
                onClick={() => setMode('magic')}
              >
                Sign in with email
              </a>
              .
            </p>
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
      email: context.query.email || '',
      state: context.query.state || null,
      mode: context.query.mode || null,
    },
  };
}
