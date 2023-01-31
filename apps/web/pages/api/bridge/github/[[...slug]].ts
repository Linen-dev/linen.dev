import nextConnectWrapper from 'server/next-connect-wrapper';
import { bridgeGithubRouter } from 'server/routers/bridge/github';

export default nextConnectWrapper().use(bridgeGithubRouter as any);
