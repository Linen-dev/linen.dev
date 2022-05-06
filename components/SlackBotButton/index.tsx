import styles from './index.module.css';
import Router from 'next/router';

const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';
const REDIRECT_URI =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';

export default function SlackBotButton() {
  async function onSubmit(event: any) {
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
          'https://slack.com/oauth/v2/' +
          `authorize?client_id=${SLACK_CLIENT_ID}&` +
          '&scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
          '&user_scope=channels:history,search:read' +
          '&state=' +
          auth.accountId +
          '&redirect_uri=' +
          REDIRECT_URI;
      }
    } catch (error) {
      alert('Something went wrong');
    }
  }
  return (
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
  );
}
