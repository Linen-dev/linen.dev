import OnboardingPage from 'components/Pages/Onboarding';
import { NextPageContext } from 'next';
import { trackPageView } from 'utilities/ssr-metrics';

export default function Onboarding() {
  return <OnboardingPage />;
}

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {},
  };
}
