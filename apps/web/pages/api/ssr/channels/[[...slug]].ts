import nextConnectWrapper from 'server/next-connect-wrapper';
import ssrRouter from 'server/routers/ssr/channels';

export default nextConnectWrapper().use(ssrRouter as any);
