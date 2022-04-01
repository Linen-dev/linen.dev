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
  if (step === Step.Auth) {
    return (
      <CreateAuthForm
        onSuccess={(id: string) => {
          setAuthId(id);
          setStep(Step.Account);
        }}
      />
    );
  }
  if (step === Step.Account) {
    return <CreateAccountForm authId={authId} />;
  }
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default SignUp;
