import React, { useEffect, useState } from 'react';
import SplashLoader from './SplashLoader';
import DefaultLayout from './DefaultLayout';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 2000);
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <SplashLoader />;
  }
  return <DefaultLayout />;
}
