import Layout from '../../components/layout/CardLayout';
import Label from '../../components/Label';
import TextInput from '../../components/TextInput';
import PasswordInput from '../../components/PasswordInput';
import Field from '../../components/Field';
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
        <Field>
          <Label htmlFor="email">Email</Label>
          <TextInput id="email" required />
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" required />
        </Field>
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
