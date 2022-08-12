import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import Button from 'components/Button';
import Link from 'components/Link';
import { useRouter } from 'next/router';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import { useState } from 'react';

interface SignUpProps {
  csrfToken: string;
}

export default function SignUp({ csrfToken }: SignUpProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Layout header="Sign Up for free">
      <form
        method="post"
        action={`/api/auth/signin/email?callbackUrl=${
          router?.query?.callbackUrl || '/settings'
        }`}
        onSubmit={() => setLoading(true)}
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <EmailField
          label="Email address"
          id="email"
          required
          defaultValue={router?.query?.email as string}
        />
        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Sign up with Email'}
        </Button>
      </form>
      <p className="text-sm pt-3 text-gray-600">
        Already have an account? <Link href="/signin">Log in</Link>
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
    },
  };
}
