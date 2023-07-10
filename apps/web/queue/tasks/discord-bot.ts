import { initializeBot } from '@linen/integration-discord';

const bot = process.argv.find((p) => p.startsWith('bot'));

if (bot && bot.includes('=')) {
  const botNumber = bot.split('=')[1];
  console.log({ botNumber });
  initializeBot(Number(botNumber), () => {});
}
