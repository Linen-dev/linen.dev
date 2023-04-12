import { cleanUp } from 'queue/tasks/remove-community';
import { config } from 'dotenv';
import { Logger } from 'graphile-worker';

function logFactory(scope: any) {
  return (level: any, message: any, meta: any) => {
    console.log(level, message, scope, meta);
  };
}

const logger = new Logger(logFactory);

config();

console.log(process.env.DATABASE_URL);

cleanUp('account-uuid', logger).catch(console.error);
