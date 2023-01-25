import nextConnectWrapper from 'server/next-connect-wrapper';
import integrationsRouter from 'server/routers/integrations';

export default nextConnectWrapper().use(integrationsRouter as any);
