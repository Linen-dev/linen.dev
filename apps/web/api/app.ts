import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import errorMiddleware from 'api/middlewares/error';
import passport from 'api/auth/passport';
import config from 'api/config';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: any[]) {
    this.app = express();
    this.env = config.NODE_ENV;
    this.port = config.PORT;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`=================================`);
      console.log(`======= ENV: ${this.env} =======`);
      console.log(`🚀 App listening on the port ${this.port}`);
      console.log(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: '*' }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(passport.initialize());
  }

  private initializeRoutes(routes: any[]) {
    routes.forEach((route) => {
      this.app.use('/api/v2', route);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
