import Layout from 'components/layout/CardLayout';
import Form from './Form';
import { createAccount } from 'utilities/requests';

export default function OnboardingPage() {
  return (
    <Layout header="Create New Community">
      <Form createAccount={createAccount} />
    </Layout>
  );
}
