import buildFactory from './build';

export function build(name: string, options?: object): any {
  return buildFactory(name, options);
}
