import nextConnectWrapper from 'server/next-connect-wrapper';
import accountsRouter from 'server/routers/accounts';

export default nextConnectWrapper().use(accountsRouter as any);
