import util from 'util';

export class Logger {
  private logger = console;
  private jobIb: string;
  private eventName: string;
  private bot: number;

  constructor(bot: number, eventName: string, jobIb: string) {
    this.jobIb = jobIb;
    this.bot = bot;
    this.eventName = eventName;
  }

  private format(level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG', json: object) {
    return util.format(
      `[discord-bot(%d: %s{%s})] ${level}: %j`,
      this.bot,
      this.eventName,
      this.jobIb,
      json
    );
  }

  info(json: object): void {
    this.logger.info(this.format('INFO', json));
  }
  log(json: object): void {
    this.info(json);
  }
  error(json: object): void {
    this.logger.error(this.format('ERROR', json));
  }
  warn(json: object): void {
    this.logger.warn(this.format('WARN', json));
  }
  debug(json: object): void {
    this.logger.debug(this.format('DEBUG', json));
  }
}
