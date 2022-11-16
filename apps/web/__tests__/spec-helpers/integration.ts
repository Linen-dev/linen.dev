import childProcess from 'child_process';
import { join } from 'path';
import { promisify } from 'util';
import { truncateTables, deleteData } from 'bin/factory/truncate';

const exec = promisify(childProcess.exec);
const PRISMA_BINARY = join(__dirname, '../../node_modules', '.bin', 'prisma');

interface Props {
  truncationStrategy: 'delete' | 'cascade' | 'none';
}

export default function setup({ truncationStrategy }: Props) {
  beforeAll(async () => {
    await exec(
      `${PRISMA_BINARY} db push --force-reset --skip-generate --accept-data-loss`
    );
  });

  afterEach(async () => {
    switch (truncationStrategy) {
      case 'delete':
        await deleteData();
      case 'cascade':
        await truncateTables();
      default:
        return null;
    }
  });
}
