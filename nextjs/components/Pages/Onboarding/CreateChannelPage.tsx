import Layout from 'components/layout/CardLayout';
import Button from 'components/Button';
import TextInput from 'components/TextInput';
import * as Sentry from '@sentry/nextjs';
import { useState } from 'react';
import { toast } from 'components/Toast';

export function CreateChannelPage() {
  const [loading, setLoading] = useState(false);

  async function onSkip() {
    window.location.href = '/settings';
  }

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const channelName = form.channelName.value;

      const accountId = window.sessionStorage.getItem('accountId');

      const response = await fetch('/api/onboarding/create-channel', {
        method: 'POST',
        body: JSON.stringify({
          channelName,
          accountId,
        }),
      });
      if (!response.ok) {
        throw response;
      } else {
        const channel = await response.json();
        window.sessionStorage.setItem('channelId', channel.id);
        window.sessionStorage.setItem('channelName', channelName);
        window.location.href = '/onboarding/invite-your-team';
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout header="Add new channel to your workspace">
      <form onSubmit={onSubmit}>
        <TextInput
          id="channelName"
          placeholder="E.g. new-channel"
          {...{
            pattern: '[a-z-]+',
            title:
              'Community path should only contain lower case letters and hyphens. e.g. linen-community',
          }}
        />
        <span className="text-xs">
          This will create a new channel in Linen. You can add more channels
          later.
        </span>
        <div className="p-4"></div>

        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Create your channel'}
        </Button>
        <Button onClick={onSkip} block color="disabled">
          Skip for now
        </Button>
      </form>
    </Layout>
  );
}
