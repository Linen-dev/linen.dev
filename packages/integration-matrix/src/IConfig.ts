export interface IConfig {
  matrix: {
    domain: string;
    homeserverUrl: string;
  };
  bridge: {
    port: number;
  };
  linen: {
    apikey: string;
    domain?: string;
  };
  webhook: {
    port: number;
    apikey: string;
  };
}
