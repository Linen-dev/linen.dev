import App from 'api/app';
import routes from 'api/routes';

const app = new App(routes);

app.listen();
