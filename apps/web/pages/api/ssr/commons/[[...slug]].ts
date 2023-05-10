import nextConnectWrapper from 'server/next-connect-wrapper';
import ssrRouter from 'server/routers/ssr/commons';

export default nextConnectWrapper().use(ssrRouter as any);
