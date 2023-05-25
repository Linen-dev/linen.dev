import { useEffect } from 'react';
import { baseLinen } from '@/config';
import LinenLogo from '@linen/ui/LinenLogo';
import { qs } from '@linen/utilities/url';
import di from '@/di';
import { cleanUpStorage } from '@linen/auth/client';

export default function SignUp() {
  useEffect(() => {
    cleanUpStorage();
    let params: any = {};
    new URLSearchParams(window.location.search).forEach((v, k) => {
      params[k] = v;
    });

    let timerId = setTimeout(() => redirectToSignUp(params), 1000);
    return () => {
      clearTimeout(timerId);
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: '2.5rem',
      }}
    >
      <LinenLogo />
    </div>
  );
}

function redirectToSignUp(params: any) {
  const query = {
    sso: 1,
    callbackUrl: encodeURI(`${di.buildExternalOrigin('signin')}`),
    ...params,
  };
  di.openExternal(`${baseLinen}/signup?${qs(query)}`);
}
