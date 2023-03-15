import Layout from 'components/layout/CardLayout';
import Form from './Form';
import { createAccount } from 'utilities/requests';

export default function OnboardingPage() {
  return (
    <Layout header="What's the name of your community?">
      <Form createAccount={createAccount} />
    </Layout>
  );
}
