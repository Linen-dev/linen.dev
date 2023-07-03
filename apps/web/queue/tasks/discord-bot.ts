import { AddJobFunction, Task, JobHelpers } from 'graphile-worker';
import { initializeBot } from '@linen/integration-discord';

export const QUEUE_DISCORD_BOT = 'discordBot';

export const scheduleDiscordBotJob: Task = async (_, helpers) => {
  await createDiscordBotJob({ botNumber: 1, addJob: helpers.addJob });
  await createDiscordBotJob({ botNumber: 2, addJob: helpers.addJob });
};

export const discordBot = async ({ botNumber }: any, helpers: JobHelpers) => {
  helpers.logger.info(JSON.stringify({ botNumber }));
  await new Promise((res, rej) => {
    initializeBot(botNumber, rej);
  });
};

export async function createDiscordBotJob({
  botNumber,
  addJob,
}: {
  botNumber: number;
  addJob: AddJobFunction;
}) {
  await addJob(
    'discordBot',
    { botNumber },
    {
      maxAttempts: 1,
      jobKeyMode: 'replace',
      queueName: `discordBot${botNumber}`,
      jobKey: `discordBot${botNumber}`,
    }
  );
}
