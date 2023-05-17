import Layout from 'components/layout/SplitLayout';
import OnboardingForm from '@linen/ui/OnboardingForm';
import { api } from 'utilities/requests';
import styles from './index.module.scss';

export default function OnboardingPage() {
  return (
    <Layout
      left={
        <div className={styles.container}>
          <h1 className="text-xl font-bold mb-4">Create New Community</h1>
          <OnboardingForm api={api} />
        </div>
      }
      right={
        <>
          <div className="text-center">
            <div className={styles.logo} />
            <p className="text-gray-700 dark:text-gray-200 mb-4">
              Linen gives your community a home,
              <br />a place where meaningful conversations can happen.
            </p>
          </div>
        </>
      }
    ></Layout>
  );
}
