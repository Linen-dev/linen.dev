import { truncateTables } from './truncate';
import createLinenCommunity from './communities/linen';
import createIpsumCommunity from './communities/ipsum';
import createDolorCommunity from './communities/dolor';
import createSitCommunity from './communities/sit';

export const seed = async () => {
  await truncateTables();

  await createLinenCommunity();
  await createIpsumCommunity();
  await createDolorCommunity();
  await createSitCommunity();
};
