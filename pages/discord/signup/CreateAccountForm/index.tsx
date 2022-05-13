import Layout from '../../../../components/layout/CardLayout';
import TextField from '../../../../components/TextField';
import ColorField from '../../../../components/ColorField';
import styles from './index.module.css';
import { stripProtocol } from '../../../../utilities/url';
import DiscordIcon from 'components/icons/DiscordIcon';

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
    const DISCORD_CLIENT_ID = process.env
      .NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
    const PERMISSIONS = '17179878400';
    const REDIRECT_URI = encodeURI(
      process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI as string
    );
    window.location.href =
      `https://discord.com/api/oauth2/authorize` +
      `?client_id=${DISCORD_CLIENT_ID}&permissions=${PERMISSIONS}&redirect_uri=${REDIRECT_URI}` +
      `&response_type=code&scope=guilds.members.read%20guilds%20bot` +
      `&state=${account.id}`;
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
          <DiscordIcon size="20" style={{ margin: '3px 8px 3px 5px' }} />
          <p>
            Add to <b>Discord</b>
          </p>
        </button>
      </form>
    </Layout>
  );
}
