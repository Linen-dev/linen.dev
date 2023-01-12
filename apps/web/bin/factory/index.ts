import { truncateTables } from './truncate';
import createLinenCommunity from './communities/linen';

export const seed = async () => {
  await truncateTables();

  await createLinenCommunity();
};
