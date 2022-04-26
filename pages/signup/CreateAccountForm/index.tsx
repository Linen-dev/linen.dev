import Layout from '../../../components/layout/CardLayout';
import TextField from '../../../components/TextField';
import ColorField from '../../../components/ColorField';
import styles from './index.module.css';
import { stripProtocol } from '../../../utilities/url';

const REDIRECT_URI =
  process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://linen.dev/api/oauth';

const SLACK_CLIENT_ID =
  process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '1250901093238.3006399856353';

interface Props {
  authId: string;
  email: string;
  password: string;
}

export default function CreateAccountForm({ authId, email, password }: Props) {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const homeUrl = form.homeUrl.value;
    const docsUrl = form.docsUrl.value;
    const redirectDomain = stripProtocol(form.redirectDomain.value);
    const brandColor = form.brandColor.value;
    const response = await fetch('/api/accounts', {
      method: 'POST',
      body: JSON.stringify({
        authId,
        homeUrl,
        docsUrl,
        redirectDomain,
        brandColor,
      }),
    });

    const account = await response.json();
    const response2 = await fetch('/api/auth', {
      method: 'PUT',
      body: JSON.stringify({
        email,
        password,
        accountId: account.id,
      }),
    });
    await response2.json();
    window.location.href =
      'https://slack.com/oauth/v2/' +
      `authorize?client_id=${SLACK_CLIENT_ID}&` +
      '&scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
      '&user_scope=channels:history,search:read' +
      '&state=' +
      account.id +
      '&redirect_uri=' +
      REDIRECT_URI;
  };

  return (
    <Layout header="Set up your account">
      <form onSubmit={onSubmit}>
        <TextField
          label="Home url"
          placeholder="https://yourwebsite.com"
          id="homeUrl"
          required
        />
        <TextField
          label="Docs url"
          placeholder="https://docs.yourwebsite.com"
          id="docsUrl"
          required
        />
        <TextField
          label="Redirect domain"
          placeholder="linen.yourwebsite.com"
          id="redirectDomain"
          required
        />
        <ColorField
          label="Brand color"
          id="brandColor"
          defaultValue="#1B194E"
          required
        />
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
