import nextConnectWrapper from 'server/next-connect-wrapper';
import channelsRouter from 'server/routers/channels';

export default nextConnectWrapper().use(channelsRouter as any);
