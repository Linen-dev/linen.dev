abstract class BaseLogger {
  abstract log(msg: string): void;
  abstract error(msg: string): void;
}

export default class Logger extends BaseLogger {
  private account: string;
  constructor(account: string) {
    super();
    this.account = account;
  }
  log(msg: string): void {
    console.log(`[${this.account}] ${msg}`);
  }
  error(msg: string): void {
    console.error(`[ERROR][${this.account}] ${msg}`);
  }
}
