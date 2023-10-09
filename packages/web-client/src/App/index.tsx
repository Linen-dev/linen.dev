import React, { useState } from 'react';
import SplashLoader from './SplashLoader';
import DefaultLayout from './DefaultLayout';

export default function App() {
  const [loading, setLoading] = useState(true);
  if (loading) {
    return <SplashLoader />;
  }
  return <DefaultLayout />;
}
