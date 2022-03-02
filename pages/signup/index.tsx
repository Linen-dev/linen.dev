import React from 'react';
import Label from '../../components/Label';
import ColorInput from '../../components/ColorInput';
import TextInput from '../../components/TextInput';
import Field from '../../components/Field';
import Card from '../../components/Card';
import styles from './index.module.css';

export default function SignUpForm() {
  const redirectDomain = 'linen.papercups.io';
  const redirectUri = 'https://linen.dev/api/oauth';

  const url =
    'https://slack.com/oauth/v2/' +
    'authorize?client_id=1250901093238.3006399856353&' +
    '&scope=channels:history,channels:join,channels:read,incoming-webhook,reactions:read,users:read,team:read' +
    '&user_scope=channels:history,search:read' +
    '&state=' +
    redirectDomain +
    '&redirect_uri=' +
    redirectUri;

  return (
    <div className={styles.page}>
      <h1 className={styles.header}>Sign Up</h1>
      <Card>
        <Field>
          <Label htmlFor="homeUrl">Home url</Label>
          <TextInput id="homeUrl" />
        </Field>
        <Field>
          <Label htmlFor="docsUrl">Docs url</Label>
          <TextInput id="docsUrl" />
        </Field>
        <Field>
          <Label htmlFor="redirectUrl">Redirect url</Label>
          <TextInput id="redirectUrl" />
        </Field>
        <Field>
          <Label htmlFor="brandColor">Brand color</Label>
          <ColorInput id="brandColor" defaultValue="#1B194E" />
        </Field>
        <a className={styles.link} href={url} rel="noopener">
          <img
            alt="Add to Slack"
            height="40"
            width="139"
            src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          />
        </a>
      </Card>
    </div>
  );
}
