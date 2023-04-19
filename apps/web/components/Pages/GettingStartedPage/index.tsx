import Button from '@linen/ui/Button';
import Toast from '@linen/ui/Toast';
import Layout from 'components/layout/SplitLayout';
import { useState } from 'react';
import styles from './index.module.scss';

type Account = {
  id: string;
  name: string;
  domain: string;
};

type Invite = Account & {
  inviteId: string;
  loading: boolean;
};

const shouldLog = process.env.NODE_ENV === 'development';

const Or = <div className="p-4 text-sm text-gray-400 text-center"> or </div>;
const Space = <div className="p-4"></div>;

export function GettingStartedPage({ session, ...rest }: any) {
  const [invites, setInvites] = useState<Invite[]>(
    rest.invites.map((i: Invite) => ({
      ...i,
      loading: false,
    }))
  );
  const [accounts] = useState<Account[]>(rest.accounts);

  const [freeCommunities] = useState<Account[]>([
    {
      domain: 'linen',
      id: 'id',
      name: 'Linen',
    },
  ]);

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
      if (shouldLog) {
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
      if (shouldLog) {
        console.error({ error });
      }
      return Toast.error('Something went wrong');
    }
  }

  return (
    <Layout className={styles.container}>
      <>
        <h1 className="text-xl font-bold pb-2 pt-8">
          Welcome {session?.user?.email}
        </h1>
        <div className="flex flex-col gap-2">
          <h2 className="font-bold">Create a new community</h2>
          <span className="text-sm text-justify">
            Linen gives your community a home — a place where they can work
            together. To create a new community, click the button below.
          </span>
          <Button onClick={() => (window.location.href = '/onboarding')}>
            Create a community
          </Button>
        </div>
      </>

      {!!freeCommunities.length && (
        <>
          {Or}
          <div className="flex flex-col gap-2">
            <h2 className="font-bold">Visit our free community</h2>
            <div className="flex flex-col gap-2 divide-y divide-solid divide-gray-200">
              {freeCommunities.map((account: Account) => (
                <div className="flex items-center" key={account.id}>
                  <div className="flex flex-col grow">
                    {account.name || account.id}
                    <span className="text-sm text-gray-500">{`linen.dev/s/${account.domain}`}</span>
                  </div>
                  <Button
                    className="-mb-2"
                    onClick={() =>
                      (window.location.href = `/s/${account.domain}`)
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

      {!!accounts.length && (
        <>
          {Space}
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
          {Space}
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
    </Layout>
  );
}
