import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import LinenSdk from '@linen/sdk';
import env from './config';

export const linenSdk = new LinenSdk(
  env.INTERNAL_API_KEY,
  appendProtocol(getIntegrationUrl())
);
