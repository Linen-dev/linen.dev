import Layout from '../../../components/layout/CardLayout';
import Label from '../../../components/Label';
import ColorInput from '../../../components/ColorInput';
import TextInput from '../../../components/TextInput';
import Field from '../../../components/Field';
import styles from './index.module.css';

const REDIRECT_URI = 'https://linen.dev/api/oauth';

interface Props {
  authId: string;
}

export default function CreateAccountForm({ authId }: Props) {
  const onSubmit = async (event: any) => {
    event.preventDefault();
    const form = event.target;
    const homeUrl = form.homeUrl.value;
    const docsUrl = form.docsUrl.value;
    const redirectDomain = form.redirectDomain.value;
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
        id: authId,
        accountId: account.id,
      }),
    });
    await response2.json();
    window.location.href =
      'https://slack.com/oauth/v2/' +
      'authorize?client_id=1250901093238.3006399856353&' +
      '&scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
      '&user_scope=channels:history,search:read' +
      '&state=' +
      account.id +
      '&redirect_uri=' +
      REDIRECT_URI;
  };

  return (
    <Layout header="Sign Up">
      <form onSubmit={onSubmit}>
        <Field>
          <Label htmlFor="homeUrl">Home url</Label>
          <TextInput placeholder="https://yourwebsite.com" id="homeUrl" />
        </Field>
        <Field>
          <Label htmlFor="docsUrl">Docs url</Label>
          <TextInput placeholder="https://docs.yourwebsite.com" id="docsUrl" />
        </Field>
        <Field>
          <Label htmlFor="redirectDomain">Redirect domain</Label>
          <TextInput
            placeholder="https://linen.yourwebsite.com"
            id="redirectDomain"
          />
        </Field>
        <Field>
          <Label htmlFor="brandColor">Brand color</Label>
          <ColorInput id="brandColor" defaultValue="#1B194E" />
        </Field>
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
