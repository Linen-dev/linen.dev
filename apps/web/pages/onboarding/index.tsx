import React from 'react';
import Pages from '@linen/ui/Pages';
import { NextPageContext } from 'next';
import { trackPageView } from 'utilities/ssr-metrics';
import { api } from 'utilities/requests';

const { Onboarding: OnboardingPage } = Pages;

export default function Onboarding() {
  return <OnboardingPage api={api} />;
}

export async function getServerSideProps(context: NextPageContext) {
  await trackPageView(context).flush();
  return {
    props: {},
  };
}
