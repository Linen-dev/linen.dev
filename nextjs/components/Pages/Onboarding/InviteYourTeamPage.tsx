import Layout from 'components/layout/CardLayout';
import Button from 'components/Button';
import EmailField from 'components/EmailField';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'components/Toast';

export function InviteYourTeamPage() {
  const [loading, setLoading] = useState(false);

  async function onSkip() {
    const pathDomain = window.sessionStorage.getItem('pathDomain');
    const channelName = window.sessionStorage.getItem('channelName');

    window.location.href =
      pathDomain && channelName
        ? `/s/${pathDomain}/c/${channelName}`
        : '/settings';
  }

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const email1 = form.email1.value;
      const email2 = form.email2.value;
      const email3 = form.email3.value;
      const channelId = window.sessionStorage.getItem('channelId');

      const response = await fetch('/api/onboarding/invite-team', {
        method: 'POST',
        body: JSON.stringify({
          email1,
          email2,
          email3,
          channelId,
        }),
      });
      if (!response.ok) {
        throw response;
      } else {
        onSkip();
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout header="Invite your team members">
      <form onSubmit={onSubmit}>
        <EmailField id="email1" label="Email" placeholder="name@team.com" />
        <EmailField id="email2" label="Email" placeholder="name@team.com" />
        <EmailField id="email3" label="Email" placeholder="name@team.com" />
        <div className="p-4"></div>

        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Invite your team members'}
        </Button>
        <Button onClick={onSkip} block color="disabled">
          Skip for now
        </Button>
      </form>
    </Layout>
  );
}
