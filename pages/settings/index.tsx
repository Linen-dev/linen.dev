import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TextField from '../../components/TextField';
import ColorField from '../../components/ColorField';
import Button from '../../components/Button';
import prisma from '../../client';
import serializeAccount from '../../serializers/account';

interface Props {
  account?: any;
}

export default function SettingsPage({ account }: Props) {
  const { data: session } = useSession();

  if (session) {
    const onSubmit = (event: any) => {
      event.preventDefault();
      const form = event.target;
      const homeUrl = form.homeUrl.value;
      const docsUrl = form.docsUrl.value;
      const redirectDomain = form.redirectDomain.value;
      const brandColor = form.brandColor.value;
      fetch('/api/accounts', {
        method: 'PUT',
        body: JSON.stringify({
          accountId: account.id,
          homeUrl,
          docsUrl,
          redirectDomain,
          brandColor,
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
          />
          <TextField
            label="Docs url"
            placeholder="https://docs.yourwebsite.com"
            id="docsUrl"
            defaultValue={account.docsUrl}
          />
          <TextField
            label="Redirect domain"
            placeholder="https://linen.yourwebsite.com"
            id="redirectDomain"
            defaultValue={account.redirectDomain}
          />
          <ColorField
            label="Brand color"
            id="brandColor"
            defaultValue={account.brandColor}
          />
          <Button type="submit">Submit</Button>
        </form>
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
  return {
    props: {
      session,
      account: serializeAccount(account),
    },
  };
}
