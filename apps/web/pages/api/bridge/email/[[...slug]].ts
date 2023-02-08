import nextConnectWrapper from 'server/next-connect-wrapper';
import { inboundRouter } from '@linen/integration-email';

export default nextConnectWrapper().use(inboundRouter as any);
