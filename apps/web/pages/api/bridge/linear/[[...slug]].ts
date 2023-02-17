import nextConnectWrapper from 'server/next-connect-wrapper';
import { bridgeLinearRouter } from '@linen/integration-linear';

export default nextConnectWrapper().use(bridgeLinearRouter as any);
