import { useState } from 'react';
import Layout from '../../components/layout/CardLayout';
import EmailField from '@linen/ui/EmailField';
import Button from '@linen/ui/Button';
import Toast from '@linen/ui/Toast';
import type { NextPageContext } from 'next';
import { trackPageView } from 'utilities/ssr-metrics';

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
        Toast.success('Please check your email for a reset link');
      } else throw response;
    } catch (exception) {
      setLoading(false);
      Toast.error('Something went wrong. Please try again.');
    }
  };
  return (
    <Layout header="Forgot Password">
      <form onSubmit={onSubmit}>
        <EmailField
          placeholder="Email address"
          id="email"
          required
          defaultValue={email}
        />
        <Button type="submit" block disabled={loading}>
          Continue
        </Button>
        <p className="text-xs  text-gray-700 dark:text-gray-100">
          Clicking continue will send you a reset password link.
        </p>
      </form>
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {
      email: context.query.email || '',
    },
  };
}
