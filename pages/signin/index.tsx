import Layout from '../../components/layout/CardLayout';
import TextField from '../../components/TextField';
import PasswordField from '../../components/PasswordField';
import Button from '../../components/Button';
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
        <TextField label="Email" id="email" required />
        <PasswordField label="Password" id="password" required />
        <Button type="submit" block>
          Submit
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
