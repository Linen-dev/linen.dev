import nextConnectWrapper from 'server/next-connect-wrapper';
import { bridgeEmailRouter } from 'server/routers/bridge/email';

export default nextConnectWrapper().use(bridgeEmailRouter as any);
