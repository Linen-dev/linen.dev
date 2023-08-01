export interface Logger {
  info(json: object): void;
  error(json: object): void;
  log(json: object): void;
  warn(json: object): void;
  debug(json: object): void;
  setPrefix(prefix: string): void;
  cleanPrefix(): void;
  time(name: string): void;
  timeLog(name: string): void;
  timeEnd(name: string): void;
}
