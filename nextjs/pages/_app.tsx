import '../styles/reset.css';
import { useRouter } from 'next/router';
import '../nprogress.scss';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { SWRConfig } from 'swr';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'components/Toast';
import { usePostHog } from 'next-use-posthog';
import { JoinContext } from 'contexts/Join';
import { UsersContext } from 'contexts/Users';

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
        <script
          defer
          data-domain="linen.dev"
          src="https://plausible.io/js/plausible.js"
        ></script>
        <title>Linen Community</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.5.1/styles/stackoverflow-light.min.css"
        ></link>
      </Head>

      <SWRConfig>
        <Toaster />
        <JoinContext>
          <UsersContext>
            <Component {...pageProps} />
          </UsersContext>
        </JoinContext>
      </SWRConfig>
    </SessionProvider>
  );
}
