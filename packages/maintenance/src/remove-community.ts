import { cleanUp } from '@linen/web/queue/tasks/remove-community';
import { config } from 'dotenv';

function logFactory(scope: any) {
  return (level: any, message: any, meta: any) => {
    console.log(level, message, scope, meta);
  };
}

config({ path: '../../apps/web/.env' });

console.log(process.env.DATABASE_URL);

const logger: any = () => {};

cleanUp('account-uuid', logger).catch(console.error);
