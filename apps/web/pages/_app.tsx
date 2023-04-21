import '../styles/reset.css';
import '../nprogress.scss';
import '../styles/globals.css';
import '../styles/highlight.scss';
import '@linen/ui/index.css';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { SessionProvider } from 'utilities/auth/react';
import Toast from '@linen/ui/Toast';
import posthog from 'posthog-js';
import { JoinContext } from 'contexts/Join';
import { UsersContext } from '@linen/contexts/Users';
import PostHogUser from 'components/PostHogUser';
import { PostHogProvider } from 'posthog-js/react';

const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_API_KEY!;
export default function App(props: AppProps) {
  const router = useRouter();

  const { Component, pageProps } = props;

  useEffect(() => {
    if (!!POSTHOG_API_KEY && typeof window !== 'undefined') {
      posthog.init(POSTHOG_API_KEY, {
        api_host: '/ph' || 'https://app.posthog.com',
        autocapture: true,
        loaded: (posthog) => {
          if (process.env.NODE_ENV === 'development') {
            posthog.opt_out_capturing();
          } else if (posthog.has_opted_out_capturing()) {
            posthog.opt_in_capturing();
          }
        },
      });
    }

    const handleStart = (url: string) => {
      console.log(`Loading: ${url}`);
      NProgress.start();
    };
    const handleStop = () => {
      posthog?.capture('$pageview');
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
          content="height=device-height, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
        />
        <meta
          name="google-site-verification"
          content="PQcYPgLYmDXcT1ORhCBmPiwKISJnj1UCEbZpQXQPiVU"
        />
      </Head>

      <Toast.ToastContext
        containerStyle={{ bottom: '2rem', left: '2rem' }}
        position="bottom-left"
      />
      <JoinContext>
        <UsersContext>
          <PostHogProvider client={posthog}>
            <PostHogUser />
            <Component {...pageProps} />
          </PostHogProvider>
        </UsersContext>
      </JoinContext>
      <Script
        defer
        data-domain="linen.dev"
        src="/pp/js/script.js"
        data-api="/pp/api/event"
      />
    </SessionProvider>
  );
}
