import OnboardingPage from 'components/Pages/Onboarding';
import { NextPageContext } from 'next';
import { trackPageView } from 'utilities/ssr-metrics';
import { api } from 'utilities/requests';

export default function Onboarding() {
  return <OnboardingPage api={api} />;
}

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {},
  };
}
