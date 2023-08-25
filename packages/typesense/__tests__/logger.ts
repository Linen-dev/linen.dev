import { Logger } from '@linen/types';

export const logger: Logger = {
  ...console,
  setPrefix: (prefix: string) => {},
  cleanPrefix: () => {},
};
