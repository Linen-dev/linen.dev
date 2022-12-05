import 'react';
import { useRouter } from 'next/router';
import SignInPage from '../../components/Pages/SignIn';
import { post, setToken } from '../../utilities/http';
import { message } from '@tauri-apps/api/dialog';

export default function SignIn() {
  const router = useRouter();
  const signIn = ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) =>
    post('/api/v2/login', { username, password })
      .then(async (response) => {
        if (response.ok) {
          const { token } = response.data as any;
          setToken(token);

          router.push('/feed');
        } else {
          await message('Email or password are incorrect. Please try again.', {
            title: 'linen.dev',
            type: 'error',
          });
        }
      })
      .catch(async () => {
        await message('Something went wrong. Please try again.', {
          title: 'linen.dev',
          type: 'error',
        });
      });
  return <SignInPage signIn={signIn} />;
}
