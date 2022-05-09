import Head from 'next/head';
import { useEffect } from 'react';

function GoogleAnalytics({
  googleAnalyticsId,
}: {
  googleAnalyticsId?: string;
}) {
  function gtag(a: any, b: any) {
    window.dataLayer.push(arguments);
  }

  useEffect(() => {
    if (googleAnalyticsId) {
      window.dataLayer = window.dataLayer || [];
      gtag('js', new Date());
      gtag('config', googleAnalyticsId);
    }
  });

  return (
    <Head>
      {googleAnalyticsId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          />
        </>
      )}
    </Head>
  );
}

export default GoogleAnalytics;
