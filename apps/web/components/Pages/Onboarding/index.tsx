import Layout from 'components/layout/SplitLayout';
import Form from './Form';
import { createAccount } from 'utilities/requests';
import logo from 'public/images/logo/linen.svg';
import styles from './index.module.scss';

export default function OnboardingPage() {
  return (
    <Layout
      left={
        <div className={styles.container}>
          <h1 className="text-xl font-bold mb-4">Create New Community</h1>
          <Form createAccount={createAccount} />
        </div>
      }
      right={
        <>
          <div className="text-center">
            <img
              className={styles.logo}
              width={133}
              height={30}
              src={logo.src}
            />
            <p className="text-gray-700 mb-4">
              Linen gives your community a home,
              <br />a place where meaningful conversations can happen.
            </p>
            <p className="text-gray-700 mb-4">
              You can also treat it as a public archive,
              <br />
              which syncs your conversations from other sources.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>Or both.</strong> It&apos;s up to you.
            </p>
          </div>
        </>
      }
    ></Layout>
  );
}
