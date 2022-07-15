import Head from 'next/head';
import { useEffect } from 'react';

function GoogleAnalytics({
  googleAnalyticsId,
  googleSiteVerification,
}: {
  googleAnalyticsId?: string;
  googleSiteVerification?: string;
}) {
  function gtag(a: any, b: any) {
    (window as any).dataLayer.push(arguments);
  }

  useEffect(() => {
    if (googleAnalyticsId) {
      (window as any).dataLayer = (window as any).dataLayer || [];
      gtag('js', new Date());
      gtag('config', googleAnalyticsId);
    }
  });

  return (
    <Head>
      {!!googleSiteVerification && (
        <meta
          name="google-site-verification"
          content={googleSiteVerification}
        />
      )}
      {!!googleAnalyticsId && (
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
