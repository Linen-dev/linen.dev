import React from 'react';
import Layout from 'components/layout/CardLayout';
import styles from './index.module.css';
import DiscordIcon from 'components/icons/DiscordIcon';
import SlackIcon from 'components/icons/SlackIcon';
import { toast } from 'components/Toast';

const REDIRECT_URI_SLACK =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';
const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
const REDIRECT_URI_DISCORD = encodeURI(
  process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string
);

function integrationAuthorizer(community: string, accountId: string) {
  switch (community) {
    case 'discord':
      window.location.href =
        `https://discord.com/api/oauth2/authorize` +
        `?client_id=${DISCORD_CLIENT_ID}` +
        `&permissions=17179878400` +
        `&redirect_uri=${REDIRECT_URI_DISCORD}` +
        `&response_type=code` +
        `&scope=guilds.members.read%20guilds%20bot` +
        `&state=${accountId}`;
      break;
    case 'slack':
      window.location.href =
        'https://slack.com/oauth/v2/authorize' +
        `?client_id=${SLACK_CLIENT_ID}` +
        '&scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
        '&user_scope=channels:history,search:read' +
        `&state=${accountId}` +
        `&redirect_uri=${REDIRECT_URI_SLACK}`;
      break;
    default:
      break;
  }
}

export default function Onboarding() {
  const onSubmit = async (community: string) => {
    try {
      const authResponse = await fetch('/api/auth', {
        method: 'PUT',
        body: JSON.stringify({
          createAccount: true,
        }),
      });
      console.log('authResponse', authResponse);
      if (!authResponse.ok) {
        throw 'create account failed';
      }
      const auth = await authResponse.json();
      community && integrationAuthorizer(community, auth.account.id);
    } catch (error) {
      return toast.error('Something went wrong, please sign in again');
    }
  };

  return (
    <Layout header="Welcome, let's set up your account">
      <form>
        <div className={styles.btnContainer}>
          <button
            className={styles.communityButton}
            type="button"
            onClick={() => onSubmit('slack')}
          >
            <SlackIcon size="25" style={{ margin: '3px 8px 3px 1px' }} />
            <p>
              Connect to <b>Slack</b>
            </p>
          </button>
          <button
            className={styles.communityButton}
            type="button"
            onClick={() => onSubmit('discord')}
          >
            <DiscordIcon size="25" style={{ margin: '3px 8px 3px 1px' }} />
            <p>
              Connect to <b>Discord</b>
            </p>
          </button>
        </div>
      </form>
    </Layout>
  );
}
