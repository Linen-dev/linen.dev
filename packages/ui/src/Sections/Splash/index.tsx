import classNames from 'classnames'
import React from 'react'
import styles from './index.module.scss'
import Container from './Container'

interface NavigationItem {
  label: string;
  url: string;
}

interface Props {
  navigation: NavigationItem[];
  signInUrl: string;
  signUpUrl: string;
}

export default function Splash ({ navigation, signInUrl, signUpUrl }: Props) {
  return <div className={classNames(styles.section, styles.clouds) }>
    <header className={styles.header}>
      <Container className={styles.nav}>
        <div className={styles.row}>
          <div className={styles.left}>
            <img src="/images/logo/linen.svg" height={28} width={126}/>
            <div className={styles.links}>
              {navigation.map((item) => <a key={item.label} className={styles.link} href={item.url}>{item.label}</a>)}
            </div>
          </div>
          <div className={styles.right}>
            <a className={styles.link} href={signInUrl}>Sign in</a>
            <a className={classNames(styles.link, styles['sign-up'])} href={signUpUrl}>Sign up</a>
          </div>
        </div>
      </Container>
    </header>
    <main className={styles.main}>
      <h1 className={styles.h1}>
        <span className={styles.everyday}>Modern </span>
        {"communication".split("").map((letter: string, index: number) => <span key={letter + index} className={classNames(styles.highlight, styles[`letter${index + 1}`])}>{letter}</span>)}
        <br/>
        tool for communities
      </h1>
      <p className={styles.description}>Most chat software is helpful, but becomes unmanageable at a certain scale. We help by offering tools that allow you to organize it and turn conversations into content.</p>
      <div className={styles.buttons}>
        <a className={classNames([styles.black, styles["get-started"]])} href={signUpUrl}>
        Get started for free
        </a>
      </div>
    </main>
  </div>
}