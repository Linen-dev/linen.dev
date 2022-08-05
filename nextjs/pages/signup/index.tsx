import React, { useState } from 'react';
import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import PasswordField from 'components/PasswordField';
import Button from 'components/Button';
import Link from 'components/Link';
import { toast } from 'components/Toast';

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (event: any) => {
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

    try {
      setLoading(true);
      const response = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      setLoading(false);
      return toast.success(json.message);
    } catch (error) {
      setLoading(false);
      return toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <Layout header="Sign Up">
      <form onSubmit={onSubmit}>
        <EmailField label="Email" id="email" required />
        <PasswordField label="Password" id="password" required />
        <Button type="submit" block disabled={loading}>
          Submit
        </Button>
      </form>
      <p className="text-sm pt-3 text-gray-600">
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>

      <p className="text-sm pt-3 text-gray-600">
        By signing up, you agree to our{' '}
        <a
          target="_blank"
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          href="https://linen.dev/legal/terms"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          target="_blank"
          href="https://linen.dev/legal/privacy"
        >
          Privacy Policy.
        </a>
      </p>
    </Layout>
  );
}
