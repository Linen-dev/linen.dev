import React, { useEffect, useState } from 'react';
import SplashLayout from './SplashLayout';
import DefaultLayout from './DefaultLayout';
import ErrorLayout from './ErrorLayout';

enum State {
  Active,
  Loading,
  Error,
}

export default function App() {
  const [state, setState] = useState(State.Loading);

  useEffect(() => {
    let mounted = true;
    fetch('/api/spa/start', {
      method: 'GET',
    })
      .then(async (response) => {
        if (mounted) {
          if (response.status === 200) {
            const data = await response.json();
            setState(State.Active);
          } else {
            setState(State.Error);
          }
        }
      })
      .catch(() => {
        if (mounted) {
          setState(State.Error);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (state === State.Loading) {
    return <SplashLayout />;
  }

  if (state === State.Error) {
    return <ErrorLayout />;
  }
  return <DefaultLayout />;
}
