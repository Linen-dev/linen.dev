import { appendProtocol } from '@linen/utilities/url';
import { getIntegrationUrl } from '@linen/utilities/domain';
import LinenSdk from '@linen/sdk';
import env from './config';

export const linenSdk = new LinenSdk({
  apiKey: env.INTERNAL_API_KEY,
  type: 'internal',
  linenUrl: appendProtocol(getIntegrationUrl()),
});
