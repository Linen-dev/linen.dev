import { useState } from 'react';
import Layout from 'components/layout/CardLayout';
import { Button, TextInput, Toast } from '@linen/ui';

export function CreateSubdomainPage() {
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: any) {
    setLoading(true);
    try {
      e.preventDefault();
      const form = e.target;
      const slackDomain = form.slackDomain.value;
      // const communityType = form.communityType.value;
      // const redirectDomain = form.redirectDomain.value;
      const accountId = window.sessionStorage.getItem('accountId');

      const response = await fetch('/api/onboarding/create-subdomain', {
        method: 'POST',
        body: JSON.stringify({
          slackDomain,
          // communityType,
          // redirectDomain,
          premium,
          accountId,
        }),
      });
      if (!response.ok) {
        throw response;
      } else {
        window.sessionStorage.setItem('pathDomain', slackDomain);
        window.location.href = '/onboarding/create-channels';
      }
    } catch (error: any) {
      console.log(error);
      if (error.status === 400) {
        const text = await error.text();
        if (text) {
          Toast.info(text);
          return;
        }
      }
      Toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout header="Tell us a little more about your community">
      <form onSubmit={onSubmit}>
        <TextInput
          id="slackDomain"
          placeholder="E.g. cool-community"
          label="What should be your community path?"
          {...{
            pattern: '[a-z-]+',
            required: true,
            title:
              'Community path should only contain lower case letters and hyphens. e.g. linen-community',
          }}
        />
        <span className="text-xs">
          Be sure to choose an url friendly name. This will define the url to
          access your community. e.g. linen.dev/s/cool-community
        </span>

        <div className="p-4"></div>

        {/* <div className="flex py-2 items-stretch">
          <Toggle
            checked={premium}
            onChange={() => {
              setPremium(!premium);
            }}
          />
          <div className="self-center pl-2">
            <Label htmlFor="">Upgrade to premium</Label>
          </div>
        </div>

        <span className="text-xs">
          Upgrading your account will trigger your trial period.
        </span>

        <div className="p-4"></div>

        <NativeSelect
          disabled={!premium}
          {...(!premium && { theme: 'gray' })}
          id="communityType"
          label="What should be your community visibility?"
          options={[
            { label: 'Public', value: AccountType.PUBLIC },
            { label: 'Private', value: AccountType.PRIVATE },
          ]}
        />
        <span className="text-xs">
          Choosing &quot;public&quot; will make your community Google
          searchable. The paid edition allows you to have a private community.
        </span>

        <div className="p-4"></div>

        <TextInput
          id="redirectDomain"
          placeholder="linen.your-domain.com"
          disabled={!premium}
          label={'Define your own subdomain'}
        />

        <span className="text-xs">
          The paid edition allows you to puts Linen behind your subdomain where
          you can generate organic SEO friendly content that is relevant for
          your domain
        </span>

        <div className="p-4"></div> */}

        <Button type="submit" block disabled={loading}>
          {loading ? 'Loading...' : 'Confirm your settings'}
        </Button>
      </form>
    </Layout>
  );
}
