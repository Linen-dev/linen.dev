import '../styles/reset.css';
import '../nprogress.scss';
import '../styles/globals.css';
import '../styles/highlight.scss';
import '@linen/ui/index.css';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { SWRConfig } from 'swr';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { SessionProvider } from 'utilities/auth/react';
import Toast from '@linen/ui/Toast';
import { usePostHog } from 'next-use-posthog';
import { JoinContext } from 'contexts/Join';
import { UsersContext } from '@linen/contexts/Users';

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;
export default function App(props: AppProps) {
  usePostHog(POSTHOG_API_KEY, {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (
        !process.env.NEXT_PUBLIC_POSTHOG_API_KEY ||
        process.env.NODE_ENV === 'development'
      )
        posthog.opt_out_capturing();
    },
  });

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
          content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, target-densitydpi=device-dpi"
        />
        <meta
          name="google-site-verification"
          content="PQcYPgLYmDXcT1ORhCBmPiwKISJnj1UCEbZpQXQPiVU"
        />
      </Head>

      <SWRConfig>
        <Toast.ToastContext
          containerStyle={{ bottom: '2rem', left: '2rem' }}
          position="bottom-left"
        />
        <JoinContext>
          <UsersContext>
            <Component {...pageProps} />
          </UsersContext>
        </JoinContext>
      </SWRConfig>
      <Script
        defer
        data-domain="linen.dev"
        src="https://plausible.io/js/plausible.js"
      />
    </SessionProvider>
  );
}
