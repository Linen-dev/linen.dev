import { findAccountAndUserByEmail } from 'lib/models';
import serializeAccount from 'serializers/account';
import { NextPageContext } from 'next';
import Session from 'services/session';
import Members, { MembersType } from 'components/Pages/DeprecatedSettings/Members';
import type { SessionType } from 'services/session';
import { findUsersAndInvitesByAccount } from 'services/invites';
import { auths, invites, users } from '@prisma/client';
import { Roles, SerializedAccount } from '@linen/types';

export interface MembersPageProps {
  session: SessionType;
  account: SerializedAccount;
  users: MembersType[];
}

export default function MembersPage(props: MembersPageProps) {
  return <Members {...props} />;
}

export async function getServerSideProps({
  req,
  res,
}: NextPageContext): Promise<{ props?: MembersPageProps; redirect?: any }> {
  const session = await Session.find(req as any, res as any);
  if (!session?.user?.email) {
    return {
      redirect: {
        permanent: false,
        destination:
          '../signin?' +
          new URLSearchParams({ callbackUrl: '/settings/members' }),
      },
    };
  }

  const accountAndUser = await findAccountAndUserByEmail(session?.user?.email);
  const { account, user } = accountAndUser || {};

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings',
      },
    };
  }

  if (user && user.role === Roles.MEMBER) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings?forbidden=1',
      },
    };
  }

  const { users, invites } = await findUsersAndInvitesByAccount(account.id);

  return {
    props: {
      users: serializeUsers(users, invites),
      session,
      account: serializeAccount(account)!,
    },
  };
}

function serializeUsers(
  users: (users & {
    auth: auths | null;
  })[],
  invites: invites[]
): MembersType[] {
  return users.map(userToMember).concat(invites.map(inviteToMember));
}

function userToMember(
  user: users & {
    auth: auths | null;
  }
): MembersType {
  return {
    id: user.id,
    email: user.auth?.email || user.displayName,
    role: user.role,
    status: 'ACCEPTED',
  };
}

function inviteToMember({ email, status, role, id }: invites): MembersType {
  return {
    id,
    email,
    role,
    status,
  };
}
