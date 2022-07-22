import '../styles/reset.css';
import { useRouter } from 'next/router';
import '../nprogress.css';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { SWRConfig } from 'swr';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'components/Toast';

declare global {
  interface Window {
    routeTimeout: any;
  }
}

export default function App(props: AppProps) {
  const router = useRouter();

  const { Component, pageProps } = props;

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== window.location.pathname) {
        window.routeTimeout = setTimeout(
          () => (window.location.href = url),
          100
        );
      }
      console.log(`Loading: ${url}`);
      NProgress.start();
    };
    const handleStop = () => {
      window.routeTimeout && clearTimeout(window.routeTimeout);
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
        <Component {...pageProps} />
      </SWRConfig>
    </SessionProvider>
  );
}
