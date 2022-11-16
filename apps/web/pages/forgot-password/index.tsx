import { useState } from 'react';
import Layout from '../../components/layout/CardLayout';
import EmailField from '../../components/EmailField';
import Button from '../../components/Button';
import { toast } from 'components/Toast';
import type { NextPageContext } from 'next';

interface Props {
  email: string;
}

export default function ForgotPassword({ email }: Props) {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        toast.success('Please check your email for a reset link');
      } else throw response;
    } catch (exception) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Layout header="Forgot Password">
      <form onSubmit={onSubmit} className="px-2">
        <EmailField
          placeholder="Email address"
          id="email"
          required
          defaultValue={email}
        />
        <Button type="submit" block disabled={loading}>
          Continue
        </Button>
        <p className="text-xs  text-gray-700">
          Clicking continue will send you a reset password link.
        </p>
      </form>
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      email: context.query.email || '',
    },
  };
}
