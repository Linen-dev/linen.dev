import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TextField from '../../components/TextField';
import ColorField from '../../components/ColorField';
import Button from '../../components/Button';
import prisma from '../../client';
import serializeAccount, { SerializedAccount } from '../../serializers/account';
import { stripProtocol } from '../../utilities/url';

interface Props {
  account?: SerializedAccount;
}

export default function SettingsPage({ account }: Props) {
  const { data: session } = useSession();

  if (session && account) {
    const onSubmit = (event: any) => {
      event.preventDefault();
      const form = event.target;
      const homeUrl = form.homeUrl.value;
      const docsUrl = form.docsUrl.value;
      const redirectDomain = stripProtocol(form.redirectDomain.value);
      const googleAnalyticsId = form.googleAnalyticsId?.value;
      const brandColor = form.brandColor.value;
      fetch('/api/accounts', {
        method: 'PUT',
        body: JSON.stringify({
          accountId: account.id,
          homeUrl,
          docsUrl,
          redirectDomain,
          brandColor,
          googleAnalyticsId,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          alert('Saved successfully!');
        });
    };

    return (
      <DashboardLayout header="Settings">
        <form onSubmit={onSubmit}>
          <TextField
            label="Home url"
            placeholder="https://yourwebsite.com"
            id="homeUrl"
            defaultValue={account.homeUrl}
            required
          />
          <TextField
            label="Docs url"
            placeholder="https://docs.yourwebsite.com"
            id="docsUrl"
            defaultValue={account.docsUrl}
            required
          />
          <TextField
            label="Redirect domain"
            placeholder="linen.yourwebsite.com"
            id="redirectDomain"
            defaultValue={account.redirectDomain}
            required
          />
          {account.premium && (
            <TextField
              label="Google analytics id"
              placeholder="UA-1-123456789-1"
              id="googleAnalyticsId"
              defaultValue={account.googleAnalyticsId}
            />
          )}
          <ColorField
            label="Brand color"
            id="brandColor"
            defaultValue={account.brandColor}
            required
          />
          <Button type="submit">Submit</Button>
        </form>
        <hr />
        <div>Slack synchronization status: {account.slackSyncStatus}</div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout header="Settings">
      <h1>You are not signed in.</h1>
    </DashboardLayout>
  );
}

async function findAccountByEmail(session?: any) {
  if (!session) {
    return null;
  }
  const email = session.user?.email;
  if (!email) {
    return null;
  }
  const auth = await prisma.auths.findFirst({ where: { email } });
  if (!auth) {
    return null;
  }
  return await prisma.accounts.findFirst({
    where: { id: auth.accountId as string },
  });
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);
  const account = await findAccountByEmail(session);

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: 'signup/CreateAccountForm',
      },
    };
  }
  return {
    props: {
      session,
      account: serializeAccount(account),
    },
  };
}
