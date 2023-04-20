import Button from '@linen/ui/Button';
import Toast from '@linen/ui/Toast';
import Layout from 'components/layout/SplitLayout';
import { useState } from 'react';
import { FiPlus } from '@react-icons/all-files/fi/FiPlus';
import styles from './index.module.scss';
import Link from 'components/Link';
import CommunityLink from 'components/NavBar/Desktop/CommunityLink';
import { SerializedAccount } from '@linen/types';

import logo from 'public/images/logo/linen.svg';

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

      openTenant(invite.id, `/s/${invite.slackDomain || invite.discordDomain}`);
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
                      />
                      <div>
                        <div className="text-sm">
                          {account.name || account.id}
                        </div>
                        <div className="text-xs text-gray-500">{`linen.dev/s/${
                          account.slackDomain || account.discordDomain
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
                    />
                    <div>
                      <div className="text-sm">{invite.name || invite.id}</div>
                      <div className="text-xs text-gray-500">{`linen.dev/s/${
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
