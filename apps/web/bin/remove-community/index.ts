import { cleanUp } from 'queue/tasks/remove-community';
import { config } from 'dotenv';

config();

console.log(process.env.DATABASE_URL);

cleanUp('account-uuid', console.log).catch(console.error);
