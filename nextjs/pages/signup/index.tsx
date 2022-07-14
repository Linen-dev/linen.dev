import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import PasswordField from 'components/PasswordField';
import Button from 'components/Button';
import Link from 'components/Link';
import { useRouter } from 'next/router';
import { toast } from 'components/Toast';
import { getCsrfToken } from 'next-auth/react';

async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const csrfToken = await getCsrfToken();
  return await fetch('/api/auth/callback/credentials?callbackUrl=/settings', {
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

export default function SignUp() {
  const router = useRouter();

  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    if (!email) {
      return toast.error('Email is required');
    }
    if (!password) {
      return toast.error('Password is required');
    }

    try {
      const signUpResponse = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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
      return toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Layout header="Sign Up">
      <form onSubmit={onSubmit}>
        <EmailField label="Email" id="email" required />
        <PasswordField label="Password" id="password" required />
        <Button type="submit" block>
          Submit
        </Button>
      </form>
      <p className="text-sm pt-3 text-gray-600">
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>

      <p className="text-sm pt-3 text-gray-600">
        By signing up, you agree to our{' '}
        <a
          target="_blank"
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          href="https://linen.dev/legal/terms"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          target="_blank"
          href="https://linen.dev/legal/privacy"
        >
          Privacy Policy.
        </a>
      </p>
    </Layout>
  );
}
