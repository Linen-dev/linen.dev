import React from 'react';
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
      <div className={styles.container}>
        <label className={styles.label} htmlFor="domain">
          Redirect domain
        </label>
        <input
          className={styles.input}
          type="text"
          id="domain"
          placeholder="discuss.airbyte.com"
        />
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
