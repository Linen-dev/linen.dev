import React from 'react';
import Alert from '@linen/ui/Alert';

interface Props {
  error?: string;
}

function getErrorMessage(error: string) {
  if (error === 'private') {
    return 'The community you are trying to access is private.';
  }
  if (error === 'forbidden') {
    return 'You are not allow to access this page.';
  }
  if (error === 'CredentialsSignin') {
    return 'Credentials are invalid.';
  }
  return 'An unexpected error occurred. Please try again later.';
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
