import { useState } from 'react';
import CreateAccountForm from './CreateAccountForm';
import CreateAuthForm from './CreateAuthForm';

enum Step {
  Auth,
  Account,
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
