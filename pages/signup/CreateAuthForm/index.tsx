import Layout from '../../../components/layout/CardLayout';
import TextField from '../../../components/TextField';
import PasswordField from '../../../components/PasswordField';
import Button from '../../../components/Button';

interface Props {
  onSuccess: ({
    authId,
    email,
    password,
  }: {
    authId: string;
    email: string;
    password: string;
  }) => void;
}

export default function CreateAuthForm({ onSuccess }: Props) {
  const onSubmit = (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    if (!email) {
      return alert('Email is required');
    }
    if (!password) {
      return alert('Password is required');
    }
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then(({ id, error }) => {
        if (error) {
          return alert(error);
        }
        return onSuccess({ authId: id, email, password });
      })
      .catch(() => {
        alert('Something went wrong. Please try again.');
      });
  };

  return (
    <Layout header="Sign Up">
      <form onSubmit={onSubmit}>
        <TextField label="Email" id="email" />
        <PasswordField label="Password" id="password" />
        <Button type="submit" block>
          Submit
        </Button>
      </form>
    </Layout>
  );
}
