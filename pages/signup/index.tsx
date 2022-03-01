import React from 'react';
import Label from '../../components/Label';
import ColorInput from '../../components/ColorInput';
import TextInput from '../../components/TextInput';
import styles from './index.module.css';

export default function SignUpForm() {
  const redirectDomain = 'linen.papercups.io';
  const redirectUri = 'https://papercups.ngrok.io/api/oauth';

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
      <div className={styles.card}>
        <div className={styles.field}>
          <Label htmlFor="homeUrl">Home url</Label>
          <TextInput id="homeUrl" />
        </div>
        <div className={styles.field}>
          <Label htmlFor="docsUrl">Docs url</Label>
          <TextInput id="docsUrl" />
        </div>
        <div className={styles.field}>
          <Label htmlFor="redirectUrl">Redirect url</Label>
          <TextInput id="redirectUrl" />
        </div>
        <div className={styles.field}>
          <Label htmlFor="color">Brand color</Label>
          <ColorInput id="color" defaultValue="#1B194E" />
        </div>
        <a className={styles.link} href={url} rel="noopener">
          <img
            alt="Add to Slack"
            height="40"
            width="139"
            src="https://platform.slack-edge.com/img/add_to_slack.png"
            srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          />
        </a>
      </div>
    </div>
  );
}
