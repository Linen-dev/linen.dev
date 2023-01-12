import { truncateTables } from './truncate';
import createLinenCommunity from './communities/linen';
import createIpsumCommunity from './communities/ipsum';

export const seed = async () => {
  await truncateTables();

  await createLinenCommunity();
  await createIpsumCommunity();
};
