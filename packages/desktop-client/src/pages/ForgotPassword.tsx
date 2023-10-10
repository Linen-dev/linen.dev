import { env } from '@/config';
import Auth from '@linen/ui/Auth';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const [email] = useState(() => {
    return searchParams.get('email') || '';
  });

  return (
    <Auth.ForgotPassword email={email} origin={env.REACT_APP_LINEN_BASE_URL} />
  );
}
