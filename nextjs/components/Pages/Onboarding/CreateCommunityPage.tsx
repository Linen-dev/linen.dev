import Layout from 'components/layout/CardLayout';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { toast } from 'components/Toast';

export function CreateCommunityPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const name = form.name.value;
      const response = await fetch('/api/onboarding/create-community', {
        method: 'POST',
        body: JSON.stringify({
          name,
        }),
      });
      if (!response.ok) {
        throw response;
      } else {
        const account = await response.json();
        window.sessionStorage.setItem('accountId', account.id);
        window.location.href = '/o/create-subdomain';
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout header="What's the name of your community?">
      <form onSubmit={onSubmit}>
        <TextInput
          id="name"
          placeholder="Community name"
          required
          type="text"
          {...{
            pattern: "[a-zA-Z0-9 ']+",
            title:
              "Community name should only contain letters, space and apostrophe. e.g. Linen's Community",
          }}
        />
        <span className="text-xs">This will setup your Linen community.</span>
        <div className="p-4"></div>

        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Create your community'}
        </Button>
      </form>
    </Layout>
  );
}
