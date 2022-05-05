import React from 'react';
import Alert from '@/components/Alert';

interface Props {
  error?: string;
}

function getErrorMessage(error: string) {
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
    <Alert type="danger">
      <strong>Error:</strong> {getErrorMessage(error)}
    </Alert>
  );
}

export default Error;
