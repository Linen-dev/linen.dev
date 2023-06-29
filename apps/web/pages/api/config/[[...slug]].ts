import nextConnectWrapper from 'server/next-connect-wrapper';
import configRouter from 'server/routers/config';

export default nextConnectWrapper().use(configRouter as any);
