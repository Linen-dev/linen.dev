import Button from 'components/Button';
import Layout from 'components/layout/CardLayout';
import { toast } from 'components/Toast';
import { useState } from 'react';

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

export function GettingStartedPage({ session, ...rest }: any) {
  const [invites, setInvites] = useState<Invite[]>(
    rest.invites.map((i: Invite) => ({
      ...i,
      loading: false,
    }))
  );
  const [accounts, setAccounts] = useState<Account[]>(rest.accounts);

  async function acceptInvite(invite: Invite) {
    try {
      setInvites((state) => {
        let idx = state.findIndex((s) => s.inviteId === invite.inviteId);
        if (idx) {
          state[idx].loading = true;
        }
        return state;
      });

      const join = await fetch('/api/users/invites/join', {
        method: 'POST',
        body: JSON.stringify({
          inviteId: invite.inviteId,
        }),
      });

      if (!join.ok) {
        throw join;
      }

      setInvites((state) =>
        state.filter((s) => s.inviteId !== invite.inviteId)
      );
      setAccounts((accounts) => [...accounts, invite]);
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
      return toast.error('Something went wrong');
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
      return toast.error('Something went wrong');
    }
  }

  return (
    <>
      <Layout header={`Welcome ${session?.user?.email}`}>
        <div className="flex flex-col gap-2">
          <h1 className="font-bold">Create a new community workspace</h1>
          <span className="text-sm text-justify">
            Linen gives your community a home — a place where they can work
            together. To create a new workspace, click the button below.
          </span>
          <Button
            onClick={() =>
              (window.location.href = '/onboarding/create-community')
            }
          >
            Create a workspace
          </Button>
        </div>

        {!!accounts.length && (
          <>
            <div className="p-4"></div>
            <div className="flex flex-col gap-2">
              <h1 className="font-bold">Open a community workspace</h1>
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
            <div className="p-4"></div>
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
    </>
  );
}
