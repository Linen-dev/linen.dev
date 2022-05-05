import '../styles/reset.css';
import { usePostHog } from 'next-use-posthog';
import { useRouter } from 'next/router';
import '../nprogress.css';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { SWRConfig } from 'swr';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/Toast';

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY || '';

export default function App(props: AppProps) {
  if (POSTHOG_API_KEY) {
    usePostHog(POSTHOG_API_KEY, { api_host: 'https://app.posthog.com' });
  }
  const router = useRouter();

  const { Component, pageProps } = props;

  useEffect(() => {
    const handleStart = (url: string) => {
      console.log(`Loading: ${url}`);
      NProgress.start();
    };
    const handleStop = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

  return (
    <SessionProvider>
      <Head>
        <title>Linen Community</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <SWRConfig>
        <Toaster />
        <Component {...pageProps} />
      </SWRConfig>
    </SessionProvider>
  );
}
