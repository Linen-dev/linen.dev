import Layout from 'components/layout/CardLayout';
import Form from './Form';
import { createAccount } from 'utilities/requests';

export default function OnboardingPage() {
  return (
    <Layout header="New community">
      <Form createAccount={createAccount} />
    </Layout>
  );
}
