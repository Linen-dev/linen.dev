import AuthRoute from 'api/routes/auth';
import AccountsRoute from 'api/routes/accounts';
import ChannelsRoute from 'api/routes/channels';
import TenantsRoute from 'api/routes/threads';
import PingRoute from 'api/routes/ping';
import DemoRoute from 'api/routes/demo';

const routes = [
  AuthRoute,
  AccountsRoute,
  ChannelsRoute,
  TenantsRoute,
  PingRoute,
  DemoRoute,
];
export default routes;
