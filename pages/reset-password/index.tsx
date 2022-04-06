import Layout from '../../components/layout/CardLayout';
import PasswordField from '../../components/PasswordField';
import Button from '../../components/Button';

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
      return alert('Passwords do not match');
    }
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        body: JSON.stringify({ password, token }),
      });
      await response.json();
      window.location.href = '/signin';
    } catch (exception) {
      alert('Something went wrong. Please try again.');
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
