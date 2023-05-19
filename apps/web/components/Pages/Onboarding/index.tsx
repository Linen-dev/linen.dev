import React from 'react';
import Layout from '@linen/ui/SplitLayout';
import OnboardingForm from '@linen/ui/OnboardingForm';
import type { ApiClient } from '@linen/api-client';
import styles from './index.module.scss';

interface Props {
  api: ApiClient;
}

export default function OnboardingPage({ api }: Props) {
  return (
    <Layout
      left={
        <div className={styles.container}>
          <h1 className={styles.header}>Create New Community</h1>
          <OnboardingForm api={api} />
        </div>
      }
      right={
        <>
          <div className={styles.right}>
            <div className={styles.logo} />
            <p className={styles.description}>
              Linen gives your community a home,
              <br />a place where meaningful conversations can happen.
            </p>
          </div>
        </>
      }
    ></Layout>
  );
}
