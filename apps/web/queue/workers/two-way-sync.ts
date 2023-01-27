import { runWorker } from '../tasks/two-way-sync';

runWorker().catch((err) => {
  console.error(err);
  process.exit(1);
});
