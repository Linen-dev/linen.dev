import Layout from '../Layout';
import Label from '../../../components/Label';
import TextInput from '../../../components/TextInput';
import PasswordInput from '../../../components/PasswordInput';
import Field from '../../../components/Field';
import Button from '../../../components/Button';

interface Props {
  onSuccess: () => void;
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
      .then(({ error }) => {
        if (error) {
          return alert(error);
        }
        return onSuccess();
      })
      .catch(() => {
        alert('Something went wrong. Please try again.');
      });
  };

  return (
    <Layout>
      <form onSubmit={onSubmit}>
        <Field>
          <Label htmlFor="email">Email</Label>
          <TextInput id="email" />
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" />
        </Field>
        <Button type="submit" block>
          Submit
        </Button>
      </form>
    </Layout>
  );
}
