import classNames from 'classnames'
import React from 'react'
import styles from './index.module.scss'

interface Props {
  id?: string;
  signUpUrl: string;
  contactUrl: string
}

export default function Pricing ({ id, signUpUrl, contactUrl }: Props) {
  return <div id={id} className={classNames(styles.section, styles.clouds)}>
    <h2>Pricing</h2>
    <div className={styles.cards}>
      <div className={classNames(styles.card, styles.free)}>
        <img src="/images/logo/linen.svg" height={28} width={126}/>
        <h3>Free</h3>
        <ul>
          <li>Crawlable</li>
          <li>Unlimited history</li>
          <li>Hosted under linen.dev</li>
          <li>Community support</li>
          <li>Drag & drop threads</li>
          <li>Show & hide channels</li>
          <li>Anonymize users</li>
          <li>Inbox</li>
          <li>Import</li>
        </ul>
        <a href={signUpUrl}>Get started for free</a>
      </div>
      <div className={classNames(styles.card, styles.premium)}>
        <img src="/images/logo/linen.svg" height={28} width={126}/>
        <h3>Premium</h3>
        <ul>
          <li>SEO Benefits</li>
          <li>Community branding</li>
          <li>Hosted under your domain</li>
          <li>Priority support</li>
          <li>2 way sync</li>
          <li>Private communities</li>
          <li>Analytics</li>
          <li>Metrics</li>
          <li>Sitemap</li>
        </ul>
        <a href={contactUrl}>Get in touch</a>
      </div>
    </div>
  </div>
}