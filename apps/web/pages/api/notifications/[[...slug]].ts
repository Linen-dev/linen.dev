import nextConnectWrapper from 'server/next-connect-wrapper';
import notificationsRouter from 'server/routers/notifications';

export default nextConnectWrapper().use(notificationsRouter as any);
