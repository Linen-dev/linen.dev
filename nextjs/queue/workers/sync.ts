import { run, runOnce } from 'graphile-worker';
import { downloadCert } from 'utilities/database';
import { findBoolArg } from 'utilities/processArgs';
import settings from '../settings';
import { sync } from '../tasks/sync';

async function main() {
  const once = findBoolArg('once');
  const worker = once ? runOnce : run;

  await downloadCert();
  // Runs until either stopped by a signal event like SIGINT
  // or by calling the stop() method on the resolved object.
  const runner = await worker({
    ...settings,
    concurrency: 2,
    taskList: {
      sync,
    },
  });

  // Immediately await (or otherwise handled) the resulting promise, to avoid
  // "unhandled rejection" errors causing a process crash in the event of
  // something going wrong.
  once ? await runner : await runner?.promise;

  // If the worker exits (whether through fatal error or otherwise), the above
  // promise will resolve/reject.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
