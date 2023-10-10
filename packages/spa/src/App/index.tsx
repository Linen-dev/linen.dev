import React, { useEffect, useState } from 'react';
import SplashLayout from './SplashLayout';
import DefaultLayout from './DefaultLayout';
import ErrorLayout from './ErrorLayout';
import { Permissions, SerializedAccount } from '@linen/types';

enum State {
  Active,
  Loading,
  Error,
}

export default function App() {
  const [state, setState] = useState(State.Loading);
  const [currentCommunity, setCurrentCommunity] = useState<SerializedAccount>();
  const [permissions, setPermissions] = useState<Permissions>();

  useEffect(() => {
    let mounted = true;
    fetch('/api/spa/start', {
      method: 'GET',
    })
      .then(async (response) => {
        if (mounted) {
          if (response.status === 200) {
            const data = await response.json();
            setCurrentCommunity(data.community);
            setPermissions(data.permissions);
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

  if (state === State.Error || !currentCommunity || !permissions) {
    return <ErrorLayout />;
  }

  return <DefaultLayout currentCommunity={currentCommunity} />;
}
