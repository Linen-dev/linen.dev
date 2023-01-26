import nextConnectWrapper from 'server/next-connect-wrapper';
import messagesRouter from 'server/routers/messages';

export default nextConnectWrapper().use(messagesRouter as any);
