import React from 'react';
import { NextPageContext } from 'next';
import { getSession, useSession } from 'next-auth/react';
import CardLayout from '../../components/layout/CardLayout';
import Label from '../../components/Label';
import TextInput from '../../components/TextInput';
import ColorInput from '../../components/ColorInput';
import Field from '../../components/Field';
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
      <CardLayout header="Settings">
        <form onSubmit={onSubmit}>
          <Field>
            <Label htmlFor="homeUrl">Home url</Label>
            <TextInput
              placeholder="https://yourwebsite.com"
              id="homeUrl"
              defaultValue={account.homeUrl}
            />
          </Field>
          <Field>
            <Label htmlFor="docsUrl">Docs url</Label>
            <TextInput
              placeholder="https://docs.yourwebsite.com"
              id="docsUrl"
              defaultValue={account.docsUrl}
            />
          </Field>
          <Field>
            <Label htmlFor="redirectDomain">Redirect domain</Label>
            <TextInput
              placeholder="https://linen.yourwebsite.com"
              id="redirectDomain"
              defaultValue={account.redirectDomain}
            />
          </Field>
          <Field>
            <Label htmlFor="brandColor">Brand color</Label>
            <ColorInput id="brandColor" defaultValue={account.brandColor} />
          </Field>
          <Button type="submit" block>
            Submit
          </Button>
        </form>
      </CardLayout>
    );
  }
  return (
    <CardLayout header="Settings">
      <h1>You are not signed in.</h1>
    </CardLayout>
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
