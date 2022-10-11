import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import Button from 'components/Button';
import Link from 'components/Link';
import TextField from 'components/TextField';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import { useState } from 'react';
import PasswordField from 'components/PasswordField';
import Error from 'pages/signin/Error';
import { qs } from 'utilities/url';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    if (!email) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    try {
      setLoading(true);
      const signUpResponse = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          ...(!!state && {
            displayName: form.displayName.value,
            accountId: state,
          }),
        }),
      });
      if (signUpResponse.ok) {
        const signInResponse = await signIn({ email, password });
        if (signInResponse.redirected) {
          window.location.href = signInResponse.url;
        }
      } else {
        throw 'error';
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  async function signIn({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) {
    const csrfToken = await getCsrfToken();
    const url = '/api/auth/callback/credentials?' + qs({ callbackUrl, state });

    return await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
        csrfToken: csrfToken as string,
      }),
      redirect: 'follow',
    });
  }

  return (
    <Layout header="Sign Up for free">
      <Error error={error} />
      <form onSubmit={onSubmit}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        {!!state && (
          <TextField
            label="Display name"
            id="displayName"
            {...{
              minlength: 1,
              maxlength: 30,
            }}
          />
        )}

        <EmailField
          label="Email address"
          id="email"
          required
          defaultValue={email}
        />
        <PasswordField label="Password" id="password" required />

        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Sign up'}
        </Button>
      </form>

      <p className="text-sm pt-3 text-gray-600">
        Already have an account?{' '}
        <Link href={`/signin?` + qs({ callbackUrl, state })}>Sign in</Link>
      </p>

      <p className="text-sm pt-3 text-gray-600">
        By signing up, you agree to our{' '}
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
