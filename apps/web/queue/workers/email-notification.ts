import { runWorker } from 'queue/tasks/email-notification';

runWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});
