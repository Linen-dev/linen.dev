import nextConnectWrapper from 'server/next-connect-wrapper';
import authRouter from 'server/routers/auth';

export default nextConnectWrapper().use(authRouter as any);
