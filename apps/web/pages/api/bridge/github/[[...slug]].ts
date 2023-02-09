import nextConnectWrapper from 'server/next-connect-wrapper';
import { bridgeGithubRouter } from '@linen/integration-github';

export default nextConnectWrapper().use(bridgeGithubRouter as any);
