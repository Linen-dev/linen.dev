import { useState } from 'react';
import Logo from '../../Logo/Linen';
import Button from '../../Button/Gradient';
import styles from './index.module.scss';

interface Props {
  signIn({ username, password }: { username: string; password: string });
}

export default function SignIn({ signIn }: Props) {
  const [loading, setLoading] = useState(false);
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
            setLoading(true);
            await signIn({
              // const response = await post('/api/v2/login', {
              username,
              password,
            });
          } finally {
            setLoading(false);
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
        <Button disabled={loading}>Continue</Button>
      </form>
    </div>
  );
}
