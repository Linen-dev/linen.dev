import CreateAuthForm from '@/components/Pages/Auth/CreateAuthForm';
import { NextPageContext } from 'next';

interface Props {
  callbackUrl: string;
}

function SignUp(props: Props) {
  return <CreateAuthForm {...props} />;
}

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      callbackUrl: context?.query?.callbackUrl || '/onboarding',
    },
  };
}

export default SignUp;
