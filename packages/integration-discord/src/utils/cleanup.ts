import { checkIntegrations } from '../linen';
import { Routes, Client, GatewayIntentBits } from 'discord.js';

async function fetchAllAccounts(bot: Client<boolean>) {
  const accounts: string[] = [];

  let lastKey;
  do {
    lastKey = await bot.guilds
      .fetch({
        limit: 25,
        after: lastKey,
      })
      .then((batch) => {
        accounts.push(...batch.map((v) => v.id));
        return batch.lastKey();
      });
  } while (lastKey);

  return accounts;
}

export async function cleanUpIntegrations(token: string, botNum: number) {
  const bot = new Client({ intents: [GatewayIntentBits.Guilds] });
  await bot.login(token);

  const accounts = await fetchAllAccounts(bot);
  console.log('accounts', accounts);

  const accountsToLeave = await checkIntegrations(accounts, botNum).then((e) =>
    accounts.filter((a) => !e.some((acc) => acc.discordServerId === a))
  );
  console.log('accountsToLeave', accountsToLeave);

  for (const acc of accountsToLeave) {
    await bot.rest.delete(Routes.userGuild(acc));
  }

  bot.destroy();
}
