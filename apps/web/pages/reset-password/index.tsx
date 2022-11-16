import Layout from '../../components/layout/CardLayout';
import PasswordField from '../../components/PasswordField';
import Button from '../../components/Button';
import { NextPageContext } from 'next';
import { toast } from 'components/Toast';
import { useState } from 'react';

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
      window.location.href = '/signin&mode=creds';
    } catch (exception) {
      toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Layout header="Reset Password">
      <form onSubmit={onSubmit} className="px-2">
        <PasswordField placeholder="Password" id="password" required />
        <PasswordField
          placeholder="Password confirmation"
          id="passwordConfirmation"
          required
        />
        <Button type="submit" block>
          Continue
        </Button>
        <p className="text-xs  text-gray-700">
          Clicking continue will reset your password and redirect you to the
          sign in page.
        </p>
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
