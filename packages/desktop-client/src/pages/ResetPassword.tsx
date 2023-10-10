import Auth from '@linen/ui/Auth';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token] = useState(() => {
    return searchParams.get('token') || '';
  });

  return <Auth.ResetPassword token={token} />;
}
