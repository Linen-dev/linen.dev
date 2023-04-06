import React from 'react';
import Alert from '@linen/ui/Alert';

interface Props {
  error?: string;
}

function getErrorMessage(error: string) {
  switch (error) {
    case 'private':
      return 'The community you are trying to access is private.';
    case 'forbidden':
      return 'You are not allowed to access this page.';
    case 'CredentialsSignin':
      return 'Credentials are invalid.';
    default:
      return 'An unexpected error occurred. Please try again later.';
  }
}

function Error({ error }: Props) {
  if (!error) {
    return null;
  }
  return (
    <div className="pb-3">
      <Alert type="danger">{getErrorMessage(error)}</Alert>
    </div>
  );
}

export default Error;
