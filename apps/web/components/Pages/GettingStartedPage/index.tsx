import Button from '@linen/ui/Button';
import Toast from '@linen/ui/Toast';
import Layout from 'components/layout/SplitLayout';
import { useState } from 'react';
import { FiMessageSquare } from '@react-icons/all-files/fi/FiMessageSquare';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import styles from './index.module.scss';
import Link from 'components/Link';

import logo from 'public/images/logo/linen.svg';
type Account = {
  id: string;
  name: string;
  domain: string;
};

type Invite = Account & {
  inviteId: string;
  loading: boolean;
};

const DEVELOPMENT = process.env.NODE_ENV === 'development';

export function GettingStartedPage({
  session,
  invites: initialInvites,
  accounts: initialAccounts,
}: any) {
  const [invites, setInvites] = useState<Invite[]>(
    initialInvites.map((invite: Invite) => ({
      ...invite,
      loading: false,
    }))
  );
  const [accounts] = useState<Account[]>(initialAccounts);

  const [freeCommunities] = useState<Account[]>([
    {
      domain: 'linen',
      id: 'id',
      name: 'Linen',
    },
  ]);

  const LINEN_COMMUNITY = {
    domain: 'linen',
    id: 'id',
    name: 'Linen',
  };

  async function acceptInvite(invite: Invite) {
    try {
      setInvites((state) => {
        let idx = state.findIndex((s) => s.inviteId === invite.inviteId);
        if (idx) {
          state[idx].loading = true;
        }
        return state;
      });

      const join = await fetch('/api/invites/join', {
        method: 'POST',
        body: JSON.stringify({
          inviteId: invite.inviteId,
        }),
      });

      if (!join.ok) {
        throw join;
      }

      openTenant(invite.id, `/s/${invite.domain}`);
    } catch (error) {
      if (DEVELOPMENT) {
        console.error({ error });
      }

      setInvites((state) => {
        let idx = state.findIndex((s) => s.inviteId === invite.inviteId);
        if (idx) {
          state[idx].loading = false;
        }
        return state;
      });
      return Toast.error('Something went wrong');
    }
  }

  async function openTenant(communityId: string, redirectTo: string) {
    try {
      const tenant = await fetch('/api/tenants', {
        method: 'POST',
        body: JSON.stringify({
          communityId,
        }),
      });

      if (!tenant.ok) {
        throw tenant;
      }

      window.location.href = redirectTo;
    } catch (error) {
      if (DEVELOPMENT) {
        console.error({ error });
      }
      return Toast.error('Something went wrong');
    }
  }

  return (
    <Layout
      left={
        <>
          {/* <h1 className="text-xl font-bold pb-2 pt-8">
            Welcome {session?.user?.email}
          </h1> */}
          <div className="text-center">
            <img
              className={styles.logo}
              width={133}
              height={30}
              src={logo.src}
            />
            <p className="text-gray-700 mb-4">
              Linen gives your community a home,
              <br />a place where they can work together.
            </p>
            <Button
              rounded="full"
              weight="bold"
              size="md"
              onClick={() => (window.location.href = '/onboarding')}
            >
              <FiPlus />
              Add a free community
            </Button>
            <p className=" text-gray-700 text-sm mb-2">
              Alternatively,{' '}
              <Link className="text-sm" href={`/s/${LINEN_COMMUNITY.domain}`}>
                join our community
              </Link>
              .
            </p>
          </div>
        </>
      }
      right={
        <>
          {!!accounts.filter((account) => account.domain !== 'linen')
            .length && (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-bold">Open a community</h1>
                <div className="flex flex-col gap-2 divide-y divide-solid divide-gray-200">
                  {accounts.map((account: Account) => (
                    <div className="flex items-center" key={account.id}>
                      <div className="flex flex-col grow">
                        {account.name || account.id}
                        <span className="text-sm text-gray-500">{`linen.dev/s/${account.domain}`}</span>
                      </div>
                      <Button
                        className="-mb-2"
                        onClick={() =>
                          openTenant(account.id, `/s/${account.domain}`)
                        }
                      >
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!!invites.length && (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="font-bold">Accept an invitation</h1>
                <div className="flex flex-col gap-2 divide-y divide-solid divide-gray-200">
                  {invites.map((invite: Invite) => (
                    <div className="flex items-center" key={invite.inviteId}>
                      <div className="flex flex-col grow">
                        {invite.name || invite.id}
                        <span className="text-sm text-gray-500">{`linen.dev/s/${invite.domain}`}</span>
                      </div>
                      <Button
                        className="-mb-2"
                        onClick={() => acceptInvite(invite)}
                      >
                        {invite.loading ? 'Joining...' : 'Join'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      }
    />
  );
}
