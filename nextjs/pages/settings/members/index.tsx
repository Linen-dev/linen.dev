import { findAccountAndUserByEmail } from 'lib/models';
import serializeAccount, { SerializedAccount } from 'serializers/account';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import Members, { MembersType } from 'components/Pages/Settings/Members';
import type { Session } from 'next-auth';
import { findUsersAndInvitesByAccount } from 'services/invites';
import { auths, invites, Roles, users } from '@prisma/client';

export interface MembersPageProps {
  session: Session;
  account: SerializedAccount;
  users: MembersType[];
}

export default function MembersPage(props: MembersPageProps) {
  return <Members {...props} />;
}

export async function getServerSideProps(
  context: NextPageContext
): Promise<{ props?: MembersPageProps; redirect?: any }> {
  const session = await getSession(context);

  if (!session?.user?.email) {
    return {
      redirect: {
        permanent: false,
        destination: '../signin',
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
        destination: '../403',
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
