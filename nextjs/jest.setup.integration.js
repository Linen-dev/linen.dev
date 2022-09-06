import childProcess from 'child_process';
import { join } from 'path';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);
const PRISMA_BINARY = join(__dirname, 'node_modules', '.bin', 'prisma');

beforeAll(async () => {
  await exec(
    `${PRISMA_BINARY} db push --force-reset --skip-generate --accept-data-loss`
  );
});
