import { webhook } from './tasks/webhook';
import { type RunnerOptions } from 'graphile-worker';

const settings: RunnerOptions = {
  connectionString: process.env.DATABASE_URL,
  concurrency: 5,
  // Install signal handlers for graceful shutdown on SIGINT, SIGTERM, etc
  noHandleSignals: false,
  pollInterval: 1000,
  // you can set the taskList or taskDirectory but not both
  taskList: {
    webhook,
  },
  // or:
  //   taskDirectory: `${__dirname}/tasks`,
};

export default settings;
