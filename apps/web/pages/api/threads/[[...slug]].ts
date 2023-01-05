import nextConnectWrapper from 'server/next-connect-wrapper';
import threadsRouter from 'server/routers/threads';

export default nextConnectWrapper().use(threadsRouter as any);
