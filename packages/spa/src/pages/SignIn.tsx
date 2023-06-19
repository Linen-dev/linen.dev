import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Auth from '@linen/ui/Auth';
import di from '@/di';
import { SignInMode } from '@linen/types';
import { env } from '@/config';

export default function SignIn() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [callbackUrl, setCallbackUrl] = useState<string>();
  const [mode, setMode] = useState<SignInMode>(() => {
    return (searchParams.get('mode') as SignInMode) || 'creds';
  });
  const [from] = useState(() => {
    let from: string = location.state?.from?.pathname || '/s/linen';
    localStorage.setItem('from', from);
    return from;
  });

  useEffect(() => {
    setCallbackUrl(mode === 'magic' ? di.buildExternalOrigin(from) : from);
  }, [mode, from]);

  return (
    <Auth.SignIn
      key={callbackUrl}
      mode={mode}
      setMode={setMode}
      withLayout
      sso="1"
      callbackUrl={callbackUrl}
      origin={di.buildExternalOrigin('/')}
      redirectFn={(e) => {
        const url = new URL(e, env.REACT_APP_LINEN_BASE_URL);
        if (url.searchParams.has('callbackUrl')) {
          url.searchParams.set('callbackUrl', di.buildExternalOrigin(from));
        }
        di.openExternal(url.toString());
      }}
    />
  );
}
