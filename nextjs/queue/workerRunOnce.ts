import { runOnce } from 'graphile-worker';
import { downloadCert } from 'utilities/database';
import settings from './settings';

async function main() {
  await downloadCert();
  // The function will run until there are no runnable jobs left, and then resolve.
  const runner = await runOnce(settings);
  await runner;

  // If the worker exits (whether through fatal error or otherwise), the above
  // promise will resolve/reject.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
