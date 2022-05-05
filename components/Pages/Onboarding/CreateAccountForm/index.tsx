/* eslint-disable @next/next/no-img-element */

import Layout from '@/components/layout/CardLayout';
import styles from './index.module.css';
import toast from '@/components/Toast';
import { accounts } from '@prisma/client';

const REDIRECT_URI =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';

const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';

interface Props {
  email: string;
  account?: accounts;
}

export default function CreateAccountForm({ email, account }: Props) {
  const createNewAccount = async (): Promise<string | undefined> => {
    const createAccountResponse = await fetch('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    if (!createAccountResponse.ok) {
      toast.error('Account Creation Failed');
      return;
    }

    const newAccount = await createAccountResponse.json();
    if (!newAccount.id) {
      toast.error('Missing Account Id');
      return;
    }

    const associateAccountToUserRequest = await fetch('/api/auth', {
      method: 'PUT',
      body: JSON.stringify({
        email,
        // password, no need since we validate the session
        accountId: newAccount.id,
      }),
    });
    if (!associateAccountToUserRequest.ok) {
      toast.error('Account Association Failed');
      return;
    }

    return newAccount.id;
  };

  const onSubmit = async (event: any) => {
    event.preventDefault();
    let accountId = account?.id || (await createNewAccount());
    if (!accountId) {
      return;
    }
    window.location.href =
      'https://slack.com/oauth/v2/' +
      `authorize?client_id=${SLACK_CLIENT_ID}&` +
      '&scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
      '&user_scope=channels:history,search:read' +
      '&state=' +
      accountId +
      '&redirect_uri=' +
      REDIRECT_URI;
  };

  return (
    <Layout header="Set up your account">
      <form onSubmit={onSubmit}>
        <button className={styles.link} type="submit">
          <img
            alt="Add to Slack"
            height="40"
            width="139"
            src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          />
        </button>
      </form>
    </Layout>
  );
}
