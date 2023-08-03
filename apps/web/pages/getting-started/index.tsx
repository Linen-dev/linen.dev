import { GettingStartedPage } from 'components/Pages/GettingStartedPage';
import type { GetServerSideProps } from 'next/types';
import Session from 'services/session';
import { findInvitesByEmail } from 'services/invites';
import { trackPageView } from 'utilities/ssr-metrics';
import { serializeAccount } from '@linen/serializers/account';
import { findAccountsFromAuth } from 'services/accounts';

export default function CreateCommunity(props: any) {
  return <GettingStartedPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await Session.find(context.req, context.res);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination:
          'signin?' + new URLSearchParams({ callbackUrl: '/getting-started' }),
      },
    };
  }

  const auth = await findAccountsFromAuth(session?.user?.email!);

  const invites = await findInvitesByEmail(session?.user?.email!);

  await trackPageView(context, session.user?.email || undefined);

  return {
    props: {
      session,
      accounts: auth?.users
        .filter(filterAccounts)
        .map((e) => serializeAccount(e.account)),
      invites: invites
        .filter(filterAccounts)
        .map((e) => ({ inviteId: e.id, ...serializeAccount(e.accounts) })),
    },
  };
};

const filterAccounts = (e: any) =>
  e.account?.discordDomain ||
  e.account?.slackDomain ||
  e.accounts?.discordDomain ||
  e.accounts?.slackDomain;
