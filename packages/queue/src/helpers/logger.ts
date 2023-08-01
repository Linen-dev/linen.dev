import util from 'util';
import type { Logger as T } from '@linen/types';
type LogHelper = {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
};

export class Logger implements T {
  private logger: LogHelper;
  private prefix: string;
  private _timeStamps: Record<string, Date>;

  constructor(logger: LogHelper, prefix?: string) {
    this.logger = logger;
    this.prefix = prefix ? `[${prefix}] ` : '';
    this._timeStamps = {};
  }
  info(json: object): void {
    this.logger.info(this.prefix + util.format('%j', json));
  }
  error(json: object): void {
    this.logger.error(this.prefix + util.format('%j', json));
  }
  log(json: object): void {
    this.info(json);
  }
  warn(json: object): void {
    this.logger.warn(this.prefix + util.format('%j', json));
  }
  debug(json: object): void {
    this.logger.debug(this.prefix + util.format('%j', json));
  }
  setPrefix(prefix: string) {
    this.prefix = `[${prefix}] `;
  }
  cleanPrefix() {
    this.prefix = ``;
  }
  time(name: string) {
    this._timeStamps[name] = new Date();
    this.logger.info(name + ': ' + this._timeStamps[name]);
  }
  timeLog(name: string) {
    if (this._timeStamps[name]) {
      const timeStamp = +new Date() - +this._timeStamps[name];
      const seconds = Math.floor(timeStamp / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      let timeStr = name + ':';
      if (hours >= 1) {
        timeStr += ' ' + hours + 'h';
      }
      if (minutes >= 1) {
        timeStr += ' ' + minutes + 'm';
      }
      if (seconds >= 1) {
        timeStr += ' ' + seconds + 's';
      }
      if (timeStamp >= 1) {
        timeStr += ' ' + (timeStamp % 1000) + 'ms';
      }
      this.logger.info(timeStr);
      return;
    }
    this.logger.warn(name + ' is not found');
  }
  timeEnd(name: string) {
    this.timeLog(name);
    delete this._timeStamps[name];
  }
}
