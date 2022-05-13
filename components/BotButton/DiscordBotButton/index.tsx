import { toast } from '@/components/Toast';
import Router from 'next/router';
import styles from './index.module.css';
import DiscordIcon from '@/components/icons/DiscordIcon';

const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
const REDIRECT_URI = encodeURI(
  process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string
);
const PERMISSIONS = '17179878400';

export default function DiscordBotButton() {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    try {
      // get info about account
      const auth = await fetch('/api/auth', {
        method: 'GET',
      }).then((e) => e.json());

      if (!auth?.accountId) {
        Router.push('/signup/CreateAccountForm');
      } else {
        // redirect to slack
        window.location.href =
          `https://discord.com/oauth2/authorize` +
          `?client_id=${DISCORD_CLIENT_ID}` +
          `&permissions=${PERMISSIONS}` +
          `&redirect_uri=${REDIRECT_URI}` +
          `&response_type=code` +
          `&scope=guilds.members.read%20guilds%20bot` +
          `&state=${auth.accountId}`;
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };
  return (
    <form onSubmit={onSubmit}>
      <button className={styles.link} type="submit">
        <DiscordIcon size="20" style={{ margin: '3px 8px 3px 5px' }} />
        <p>
          Add to <b>Discord</b>
        </p>
      </button>
    </form>
  );
}
