import { GettingStartedPage } from 'components/Pages/GettingStartedPage';
import type { NextPageContext } from 'next';
import Session from 'services/session';
import { prisma } from '@linen/database';
import { findInvitesByEmail } from 'services/invites';
import { trackPageView } from 'utilities/ssr-metrics';

export default function CreateCommunity(props: any) {
  return <GettingStartedPage {...props} />;
}

export async function getServerSideProps({ req, res }: NextPageContext) {
  const track = trackPageView({ req, res });

  const session = await Session.find(req as any, res as any);

  if (!session) {
    return {
      redirect: {
        permanent: false,
        destination:
          'signin?' + new URLSearchParams({ callbackUrl: '/getting-started' }),
      },
    };
  }
  session.user?.id && track.knownUser(session.user.id);

  const auth = await findAccountsFromAuth(session?.user?.email!);

  const invites = await findInvitesByEmail(session?.user?.email!);

  await track.flush();

  return {
    props: {
      session,
      accounts: auth?.users
        .filter(filterAccounts)
        .map((e) => mapAccounts(e.account)),
      invites: invites
        .filter(filterAccounts)
        .map((e) => ({ inviteId: e.id, ...mapAccounts(e.accounts) })),
    },
  };
}

const filterAccounts = (e: any) =>
  e.account?.discordDomain ||
  e.account?.slackDomain ||
  e.accounts?.discordDomain ||
  e.accounts?.slackDomain;

async function findAccountsFromAuth(email: string) {
  return await prisma.auths.findUnique({
    where: { email },
    include: {
      users: {
        include: {
          account: {
            select: {
              id: true,
              name: true,
              discordDomain: true,
              slackDomain: true,
            },
          },
        },
      },
    },
  });
}

const mapAccounts = (
  account?: {
    id: string;
    name: string | null;
    discordDomain: string | null;
    slackDomain: string | null;
  } | null
) => ({
  id: account?.id,
  name: account?.name,
  domain: account?.slackDomain || account?.discordDomain,
});
