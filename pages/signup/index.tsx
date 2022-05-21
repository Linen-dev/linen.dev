import { useState } from 'react';
import { getCsrfToken } from 'next-auth/react';
import CreateAccountForm from './CreateAccountForm';
import CreateAuthForm from './CreateAuthForm';

enum Step {
  Auth,
  Account,
}

async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const csrfToken = await getCsrfToken();
  await fetch('/api/auth/callback/credentials?callbackUrl=/foo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email,
      password,
      csrfToken: csrfToken as string,
    }),
    redirect: 'manual',
  });
}

function SignUp() {
  const [step, setStep] = useState(Step.Auth);
  const [authId, setAuthId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  if (step === Step.Auth) {
    return (
      <CreateAuthForm
        onSuccess={({ authId, email, password }) => {
          setAuthId(authId);
          setEmail(email);
          setPassword(password);
          setStep(Step.Account);
          signIn({ email, password });
        }}
      />
    );
  }
  if (step === Step.Account) {
    return (
      <CreateAccountForm authId={authId} email={email} password={password} />
    );
  }
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default SignUp;
