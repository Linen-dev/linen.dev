import React from 'react';
import Pages from '@linen/ui/Pages';
import type { GetServerSideProps } from 'next/types';
import { trackPageView } from 'utilities/ssr-metrics';
import { api } from 'utilities/requests';

const { Onboarding: OnboardingPage } = Pages;

export default function Onboarding() {
  return <OnboardingPage api={api} />;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  await trackPageView(context);
  return {
    props: {},
  };
};
