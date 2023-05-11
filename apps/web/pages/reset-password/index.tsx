import Layout from 'components/layout/CardLayout';
import PasswordField from '@linen/ui/PasswordField';
import Button from '@linen/ui/Button';
import { NextPageContext } from 'next';
import Toast from '@linen/ui/Toast';
import { trackPageView } from 'utilities/ssr-metrics';

interface Props {
  token: string;
}

export default function ResetPassword({ token }: Props) {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const password = form.password.value;
    const passwordConfirmation = form.passwordConfirmation.value;
    if (password !== passwordConfirmation) {
      Toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password, token }),
      });
      await response.json();
      window.location.href = '/signin?mode=creds';
    } catch (exception) {
      Toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Layout header="Reset Password">
      <form onSubmit={onSubmit}>
        <PasswordField placeholder="Password" id="password" required />
        <PasswordField
          placeholder="Password confirmation"
          id="passwordConfirmation"
          required
        />
        <Button type="submit" block>
          Continue
        </Button>
        <p className="text-xs text-gray-700 dark:text-gray-100">
          Clicking continue will reset your password and redirect you to the
          sign in page.
        </p>
      </form>
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {
      token: context.query.token,
    },
  };
}
