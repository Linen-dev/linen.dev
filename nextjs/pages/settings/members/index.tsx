import { findAccountByEmail } from 'lib/models';
import serializeAccount, { SerializedAccount } from 'serializers/account';
import { NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import Members, { MembersType } from 'components/Pages/Settings/Members';
import type { Session } from 'next-auth';
import { findUsersAndInvitesByAccount } from 'services/invites';
import { auths, invites, users } from '@prisma/client';

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

  const account = await findAccountByEmail(session?.user?.email).then(
    serializeAccount
  );

  if (!account) {
    return {
      redirect: {
        permanent: false,
        destination: '../settings',
      },
    };
  }

  const { users, invites } = await findUsersAndInvitesByAccount(account.id);

  return {
    props: {
      users: serializeUsers(users, invites),
      session,
      account,
    },
  };
}

function serializeUsers(
  users: (auths & {
    users: users[];
  })[],
  invites: invites[]
): MembersType[] {
  return users.map(userToMember).concat(invites.map(inviteToMember));
}

function userToMember({
  email,
  users,
}: auths & {
  users: users[];
}): MembersType {
  return {
    email,
    role: users?.shift()?.role || 'ADMIN',
    status: 'ACCEPTED',
  };
}

function inviteToMember({ email, status, role }: invites): MembersType {
  return {
    email,
    role,
    status,
  };
}
