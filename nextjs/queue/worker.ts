import { run } from 'graphile-worker';
import { downloadCert } from 'utilities/database';
import settings from './settings';

async function main() {
  await downloadCert();
  // Runs until either stopped by a signal event like SIGINT
  // or by calling the stop() method on the resolved object.
  const runner = await run(settings);

  // Immediately await (or otherwise handled) the resulting promise, to avoid
  // "unhandled rejection" errors causing a process crash in the event of
  // something going wrong.
  await runner.promise;

  // If the worker exits (whether through fatal error or otherwise), the above
  // promise will resolve/reject.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
