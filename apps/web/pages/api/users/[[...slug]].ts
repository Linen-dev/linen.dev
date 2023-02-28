import nextConnectWrapper from 'server/next-connect-wrapper';
import usersRouter from 'server/routers/users';

export default nextConnectWrapper().use(usersRouter as any);
