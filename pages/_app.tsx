import '../styles/reset.css';
import '../styles/globals.css';
import { SWRConfig } from 'swr';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { useEffect } from 'react';

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <SWRConfig>
        <Component {...pageProps} />
      </SWRConfig>
    </>
  );
}
