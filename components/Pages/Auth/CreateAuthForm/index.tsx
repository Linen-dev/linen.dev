import Layout from '@/components/layout/CardLayout';
import EmailField from '@/components/EmailField';
import PasswordField from '@/components/PasswordField';
import Button from '@/components/Button';
import Link from '@/components/Link';
import Router from 'next/router';
import toast from '@/components/Toast';

interface Props {
  callbackUrl: string;
}

export default function CreateAuthForm({ callbackUrl }: Props) {
  const onSubmit = (event: any) => {
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
    fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then(({ id, error }) => {
        if (error) {
          return toast.error(error);
        }
        Router.push(`/signin?callbackUrl=${callbackUrl}`);
        return toast.success('Welcome aboard, please sign in!');
      })
      .catch(() => {
        toast.error('Something went wrong. Please try again.');
      });
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
      <p className="text-sm pt-3">
        Already have an account?{' '}
        <Link href={`/signin?callbackUrl=${callbackUrl}`}>Sign in!</Link>
      </p>
    </Layout>
  );
}
