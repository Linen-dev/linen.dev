import Logo from '../../Logo/Linen';
import Button from '../../Button/Gradient';
import styles from './index.module.scss';
import { post } from '../../../utilities/http';
import { message } from '@tauri-apps/api/dialog';

interface Props {
  onSignIn({
    token,
    refreshToken,
  }: {
    token: string;
    refreshToken: string;
  }): void;
}

export default function SignIn({ onSignIn }: Props) {
  return (
    <div className={styles.container}>
      <Logo className={styles.logo} />
      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault();
          const form = event.target as HTMLFormElement;
          const username = form.username.value;
          const password = form.password.value;
          if (!username || !password) {
            return;
          }
          try {
            const response = await post('/api/v2/login', {
              username,
              password,
            });
            if (response.ok) {
              onSignIn(
                response.data as { token: string; refreshToken: string }
              );
            } else {
              await message(
                'Email or password are incorrect. Please try again.',
                { title: 'linen.dev', type: 'error' }
              );
            }
          } catch (exception) {
            await message('Something went wrong. Please try again.', {
              title: 'linen.dev',
              type: 'error',
            });
          }
        }}
      >
        <input
          className={styles.input}
          type="text"
          name="username"
          placeholder="Email"
        />
        <input
          className={styles.input}
          type="password"
          name="password"
          placeholder="Password"
        />
        <Button>Continue</Button>
      </form>
    </div>
  );
}
