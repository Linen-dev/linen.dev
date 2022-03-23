import { useState } from 'react';
import CreateAccountForm from './CreateAccountForm';
import CreateAuthForm from './CreateAuthForm';

enum Step {
  Auth,
  Account,
}

function SignUp() {
  const [step, setStep] = useState(Step.Auth);
  if (step === Step.Auth) {
    return <CreateAuthForm onSuccess={() => setStep(Step.Account)} />;
  }
  if (step === Step.Account) {
    return <CreateAccountForm />;
  }
}

export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

export default SignUp;
