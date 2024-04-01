import Button from '@linen/ui/Button';
import Toast from '@linen/ui/Toast';
import Layout from '@linen/ui/SplitLayout';
import { useState } from 'react';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import { FiFileText } from '@react-icons/all-files/fi/FiFileText';
import styles from './index.module.scss';
import Link from 'components/Link';
import CommunityLink from '@linen/ui/CommunityLink';
import { SerializedAccount } from '@linen/types';
import { getHomeUrl } from '@linen/utilities/home';

type Invite = SerializedAccount & {
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
  const [accounts] = useState<SerializedAccount[]>(initialAccounts);

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

      openTenant(
        invite.id,
        `/s/${
          invite.slackDomain || invite.discordDomain || invite.discordServerId
        }`
      );
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
          <div className="text-center">
            <div className={styles.logo} />
            <p className="text-gray-700 dark:text-gray-200 mb-4">
              Linen gives your community a home,
              <br />a place where meaningful conversations can happen.
            </p>
            <div className={styles.buttons}>
              <Button
                rounded="full"
                weight="bold"
                size="md"
                onClick={() => (window.location.href = '/onboarding')}
              >
                <FiPlus />
                Create new community
              </Button>
              <Button
                rounded="full"
                weight="bold"
                size="md"
                color="white"
                outlined
                onClick={() => (window.location.href = '/onboarding')}
              >
                <FiFileText />
                Import your community
              </Button>
            </div>
            <p className="text-gray-700 dark:text-gray-200 text-sm mb-2">
              Any questions before you start?
              <br />
              <Link className="text-sm" href={`/s/${LINEN_COMMUNITY.domain}`}>
                Join our community
              </Link>
              .
            </p>
          </div>
        </>
      }
      right={
        <>
          {!!accounts.filter(
            (account) =>
              account.slackDomain !== 'linen' &&
              account.discordDomain !== 'linen'
          ).length && (
            <div className={styles.list}>
              <h2 className={styles.header}>Communities</h2>
              <div className={styles.grid}>
                {accounts
                  .filter(
                    (account) =>
                      account.slackDomain !== 'linen' &&
                      account.discordDomain !== 'linen'
                  )
                  .map((account) => (
                    <div className={styles.item} key={account.id}>
                      <CommunityLink
                        className={styles.link}
                        community={account}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          openTenant(
                            account.id,
                            `/s/${account.slackDomain || account.discordDomain}`
                          );
                        }}
                        getHomeUrl={getHomeUrl}
                        selected={false}
                      />
                      <div>
                        <div className="text-sm">
                          {account.name || account.id}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-300">{`linen.dev/s/${
                          account.slackDomain ||
                          account.discordDomain ||
                          account.discordServerId
                        }`}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!!invites.length && (
            <div className={styles.list}>
              <h2 className={styles.header}>Invites</h2>
              <div className={styles.grid}>
                {invites.map((invite) => (
                  <div className={styles.item} key={invite.id}>
                    <CommunityLink
                      className={styles.link}
                      community={invite}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        acceptInvite(invite);
                      }}
                      getHomeUrl={getHomeUrl}
                      selected={false}
                    />
                    <div>
                      <div className="text-sm">{invite.name || invite.id}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300">{`linen.dev/s/${
                        invite.slackDomain || invite.discordDomain
                      }`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      }
    />
  );
}
