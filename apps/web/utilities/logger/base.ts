export default abstract class BaseLogger {
  abstract log(msg: string): void;
  abstract error(msg: string): void;
}
