import '../styles/reset.css';
import { useRouter } from 'next/router';
import '../nprogress.css';
import NProgress from 'nprogress';
import '../styles/globals.css';
import { SWRConfig } from 'swr';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';

export default function App(props: AppProps) {
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

// export default function App({ Component, pageProps }) {
//   const router = useRouter();

//   useEffect(() => {
//     const handleStart = (url) => {
//       console.log(`Loading: ${url}`);
//       NProgress.start();
//     };
//     const handleStop = () => {
//       NProgress.done();
//     };

//     router.events.on('routeChangeStart', handleStart);
//     router.events.on('routeChangeComplete', handleStop);
//     router.events.on('routeChangeError', handleStop);

//     return () => {
//       router.events.off('routeChangeStart', handleStart);
//       router.events.off('routeChangeComplete', handleStop);
//       router.events.off('routeChangeError', handleStop);
//     };
//   }, [router]);

//   return (
//     <>
//       <nav>
//         <style jsx>{`
//           a {
//             margin: 0 10px 0 0;
//           }
//         `}</style>
//         <Link href="/">
//           <a>Home</a>
//         </Link>
//         <Link href="/about">
//           <a>About</a>
//         </Link>
//         <Link href="/forever">
//           <a>Forever</a>
//         </Link>
//         <a href="/non-existing">Non Existing Page</a>
//       </nav>
//       <Component {...pageProps} />
//     </>
//   );
// }
