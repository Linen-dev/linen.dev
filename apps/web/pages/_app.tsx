import '@linen/styles/colors.css';
import '@linen/styles/reset.css';
import '@linen/styles/nprogress.scss';
import '@linen/styles/globals.css';
import '@linen/styles/highlight.scss';
import '@linen/ui/index.css';
import { useRouter } from 'next/router';
import NProgress from 'nprogress';
import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { useEffect } from 'react';
import { SessionProvider } from '@linen/auth/client';
import Toast from '@linen/ui/Toast';
import posthog from 'posthog-js';
import { JoinContext } from 'contexts/Join';
import { UsersContext } from '@linen/contexts/Users';
import PostHogUser from 'components/PostHogUser';
import { PostHogProvider } from 'posthog-js/react';

if (
  typeof window !== 'undefined' &&
  !!process.env.NEXT_PUBLIC_POSTHOG_API_KEY
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY, {
    api_host: '/ph' || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug();
    },
  });
}

export default function App(props: AppProps) {
  const router = useRouter();

  const { Component, pageProps } = props;

  useEffect(() => {
    const handleStart = (url: string) => {
      NProgress.start();
    };
    const handleStop = () => {
      posthog?.capture('$pageview');
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);
    router.beforePopState(({ options }: { options: any }) => {
      if (options?._preventNextJSReload) {
        return false;
      }
      return true;
    });

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
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" key="twcard" />
        <meta name="twitter:creator" content="@linen_dev" key="linen_dev" />
        <meta
          name="twitter:image"
          content="https://static.main.linendev.com/logos/logo63448d11-cc57-4c35-8b16-5064ebae803c.png"
          key="twimage"
        />
      </Head>

      <Toast.ToastContext
        containerStyle={{ top: '4rem', right: '1rem' }}
        position="top-right"
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
