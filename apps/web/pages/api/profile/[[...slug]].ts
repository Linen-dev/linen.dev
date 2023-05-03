import nextConnectWrapper from 'server/next-connect-wrapper';
import profileRouter from 'server/routers/profile';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default nextConnectWrapper().use(profileRouter as any);
