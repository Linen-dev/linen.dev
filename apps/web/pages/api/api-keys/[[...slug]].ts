import nextConnectWrapper from 'server/next-connect-wrapper';
import apiKeysRouter from 'server/routers/api-keys';

export default nextConnectWrapper().use(apiKeysRouter as any);
