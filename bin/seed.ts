import { createAuth } from '../lib/auth';
import { createAccount, findAccount } from '../lib/account';

(async () => {
  const account =
    (await findAccount({ redirectDomain: 'linen.dev' })) ||
    (await createAccount({
      homeUrl: 'https://linen.dev',
      docsUrl: 'https://linen.dev/docs',
      redirectDomain: 'linen.dev',
      brandColor: '#00bcd4',
    }));

  const users = [
    'emil@linen.dev',
    'jarek@linen.dev',
    'kam@linen.dev',
    'sandro@linen.dev',
  ];
  await Promise.all(
    users.map(async (email) => {
      try {
        await createAuth({
          email,
          password: 'password',
          accountId: account.id,
        });
      } catch (exception) {
        console.log(`User ${email} already exists`);
      }
    })
  );
})();
