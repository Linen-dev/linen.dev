import Layout from '../../components/layout/CardLayout';
import PasswordField from '../../components/PasswordField';
import Button from '../../components/Button';
import { NextPageContext } from 'next';
import { toast } from 'components/Toast';

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
      toast.error('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password, token }),
      });
      await response.json();
      window.location.href = '/signin';
    } catch (exception) {
      toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Layout header="Reset Password">
      <form onSubmit={onSubmit}>
        <PasswordField label="Password" id="password" required />
        <PasswordField
          label="Password confirmation"
          id="passwordConfirmation"
          required
        />
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
      token: context.query.token,
    },
  };
}
