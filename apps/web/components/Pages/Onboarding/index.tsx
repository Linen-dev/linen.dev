import Layout from 'components/layout/SplitLayout';
import Form from './Form';
import { createAccount } from 'utilities/requests';
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
      right={<></>}
    ></Layout>
  );
}
