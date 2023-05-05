import nextConnectWrapper from 'server/next-connect-wrapper';
import ssrRouter from 'server/routers/ssr/threads';

export default nextConnectWrapper().use(ssrRouter as any);
