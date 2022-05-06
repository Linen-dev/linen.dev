import {
  findOrCreateAccount,
  findOrCreateUser,
  findOrCreateChannel,
} from './factory';

(async () => {
  const account = await findOrCreateAccount({ domain: 'linen.dev' });
  await findOrCreateUser({ email: 'emil@linen.dev', accountId: account.id });
  await findOrCreateUser({ email: 'jarek@linen.dev', accountId: account.id });
  await findOrCreateUser({ email: 'kam@linen.dev', accountId: account.id });
  await findOrCreateUser({ email: 'sandro@linen.dev', accountId: account.id });
  await findOrCreateChannel({ name: 'general', accountId: account.id });
})();
