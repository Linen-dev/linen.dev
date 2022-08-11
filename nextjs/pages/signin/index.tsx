import Layout from '../../components/layout/CardLayout';
import EmailField from '../../components/EmailField';
import Button from '../../components/Button';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';
import Error from './Error';
import { useRouter } from 'next/router';

interface Props {
  csrfToken: string;
  error?: string;
}

export default function SignIn({ csrfToken, error }: Props) {
  const router = useRouter();
  return (
    <Layout header="Sign In">
      <Error error={error} />
      <form
        method="post"
        action={`/api/auth/signin/email?callbackUrl=${
          router?.query?.callbackUrl || '/settings'
        }`}
      >
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
